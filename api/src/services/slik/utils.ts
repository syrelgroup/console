import moment from "moment";
import type { IDebitur, IFacilities } from "@syrel/shared";
import { calculateInstallment } from "./interestUtil.js";

export function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, "")
    .trim();
}

export function parseDebitur(section: string): IDebitur {
  const beforeNik = section.split("NIK")[0];
  const nik = section.match(/\b\d{16}\b/)?.[0];
  const lines = beforeNik
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const nama = lines.reverse().find((x) => /^[A-Za-z .,'-]+$/.test(x));
  const jk = section.match(/(LAKI-LAKI|PEREMPUAN)/)?.[1];

  // 1. Tanggal Lahir
  const birthdateMatch = section.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
  const birthInfo = section.match(
    /(LAKI-LAKI|PEREMPUAN)\s*\/\s*([A-Za-z .'-]+)\s*\/\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i,
  );
  const birthplace = birthInfo?.[2]?.trim() ?? null;
  const birthdateStr = birthdateMatch?.[1] || null;

  // 3. PERBAIKAN NPWP: Menggunakan [0] agar aman untuk kedua jenis regex, plus optional chaining ?.trim()
  const npwpMatch =
    section.match(/NPWP[\s:]*([\d.\-]{15,20})/i) ||
    section.match(/\b\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}\b/);
  // Kita bersihkan teks "NPWP" dan tanda titik dua jika yang kecocokan pertama yang aktif
  const npwp = npwpMatch
    ? npwpMatch[0].replace(/NPWP[\s:]*/i, "").trim()
    : null;

  // 4. Alamat Terakhir (ditambahkan opsional chaining agar aman jika match gagal)
  const alamat: string | null = parseAddress(section);

  return {
    fullname: nama || null,
    nik: nik || null,
    gender: jk || null,
    birthplace: birthplace || null,
    birthdate: toDate(birthdateStr || ""),
    npwp: npwp || null,
    address: alamat || null,
  };
}

export function getSummary(text: string) {
  const collectMatch = text.match(/(\d+)\s*\/\s*[a-zA-Z]+\s*\d{4}/);
  return {
    total_plafond: toNumber(text.match(/Plafon Efektif\s+([\d.,]+)/)?.[1]),
    total_os: toNumber(text.match(/Baki Debet\s+([\d.,]+)/)?.[1]),
    collect: collectMatch ? Number(collectMatch[1]) : 0,
  };
}

export function parseFacility(page: string): IFacilities {
  const parse = parsePelapor(page);
  const kondisi = page.match(/Kondisi\s+(.*?)\n/)?.[1]?.trim();

  // Ambil nilai Baki Debet & Plafon secara independen menggunakan regex yang lebih aman
  const bakiDebetMatch =
    page.match(/Baki Debet\s+Rp\s*([\d.,]+)/i) ||
    page.match(/Rp\s*([\d.,]+)\s+\d{2}/);
  const plafonMatch = page.match(/Plafon\s+Rp\s*([\d.,]+)/i);

  // Perbaikan definisi status aktif: Kondisi tidak kosong dan bukan "Lunas"
  const isAktif =
    kondisi && kondisi !== "Lunas" && kondisi !== "Dihapusbukukan";
  const interestMatch = page.match(/Suku Bunga\/Imbalan\s+([\d.,]+)\s*%/i);
  const interestTypeMatch = page.match(/Jenis Suku Bunga\/Imbalan\s+(.*?)\n/i);
  const interestType =
    interestTypeMatch?.[1]
      .trim()
      .replace("Suku Bunga", "")
      .replaceAll(" ", "") || "Unknown";
  const startAt = toDate(
    page.match(/Tanggal Awal Kredit\s+(.*?)\s+Tunggakan/)?.[1],
  );
  const endAt = toDate(
    page.match(/Tanggal Jatuh Tempo\s+(.*?)\s+Frekuensi/)?.[1],
  );
  const collectMatch = page.match(/Kualitas\s+(\d+)/i);

  // Jika ingin mendapatkan labelnya (misal: "Lancar", "Macet")
  // Terkadang formatnya: "Kualitas 1 - Lancar"
  const collectLabelMatch = page.match(/Kualitas\s+\d+\s*-\s*(.*?)\n/i);

  const tenorMonths =
    startAt && endAt
      ? (new Date(endAt).getFullYear() - new Date(startAt).getFullYear()) * 12 +
        (new Date(endAt).getMonth() - new Date(startAt).getMonth())
      : 0;
  const installment = calculateInstallment(
    toNumber(plafonMatch?.[1]),
    parseFloat(interestMatch?.[1].replace(",", ".") || "0"),
    tenorMonths,
    interestType as any,
  );

  return {
    name: parse.namaPelapor || "",
    os: toNumber(bakiDebetMatch?.[1]),
    plafond: toNumber(plafonMatch?.[1]),
    condition: kondisi || "",
    start_at: toDate(
      page.match(/Tanggal Awal Kredit\s+(.*?)\s+Tunggakan/)?.[1],
    ),
    end_at: toDate(page.match(/Tanggal Jatuh Tempo\s+(.*?)\s+Frekuensi/)?.[1]),
    interest_rate: parseFloat(interestMatch?.[1].replace(",", ".") || "0"),
    interest_type: interestType,
    tenor: tenorMonths,
    collect: collectMatch ? parseInt(collectMatch[1], 10) : 0,
    collect_label: collectLabelMatch ? collectLabelMatch[1].trim() : "Unknown",
    installment,
    status: !!isAktif,
  };
}

export function parsePelapor(page: string) {
  const lines = page.split("\n").map((l) => l.trim());
  const index = lines.findIndex((l) => /^\d+\s*-\s*PT/i.test(l));

  if (index === -1) {
    return { kodePelapor: "", namaPelapor: "" };
  }

  let namaRaw = lines[index];

  // FIX: Batasi pengambilan baris berikutnya agar tidak menyedot string nominal "Rp" atau tanggal
  if (
    lines[index + 1] &&
    !lines[index + 1].startsWith("Pelapor") &&
    !lines[index + 1].includes("Rp") &&
    !/^\d{2}/.test(lines[index + 1])
  ) {
    namaRaw += " " + lines[index + 1];
  }

  // Bersihkan teks sisa yang tidak sengaja terbawa sebelum memisahkan kode dan nama
  const cleanNama = namaRaw.split(/Rp\s*[\d.,]+/i)[0].trim();
  const match = cleanNama.match(/^(\d+)\s*-\s*(.*)$/);

  return {
    kodePelapor: match?.[1] ?? "",
    namaPelapor: match?.[2].replace(/\s+/g, " ").trim() ?? "",
  };
}

export function toNumber(value?: string) {
  if (!value) return 0;
  return Number(value.replace(/\./g, "").replace(",", "."));
}

export function toDate(value?: string): string | null {
  if (!value) return null;
  const formats = ["DD MMMM YYYY", "D MMMM YYYY", "DD MMM YYYY", "D MMM YYYY"];
  const date = moment(value.trim(), formats, "id", true);
  return date.isValid() ? date.format("YYYY-MM-DD") : null;
}

function parseAddress(section: string): string | null {
  const lines = section
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const idx = lines.findIndex((x) => /^Alamat/i.test(x));

  if (idx === -1) return null;

  const result = [];

  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];

    if (
      /^Nama Sesuai/i.test(line) ||
      /^Pelapor/i.test(line) ||
      /^Ringkasan/i.test(line) ||
      /^Pekerjaan/i.test(line) ||
      /^Lain-lain/i.test(line)
    )
      break;

    // skip header tabel
    if (/Kelurahan|Kecamatan|Kabupaten|Kode Pos|Negara/i.test(line)) continue;

    result.push(line);
  }

  return result.join(" ").replace(/\s+/g, " ").trim();
}
