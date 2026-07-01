// src/components/pdfs/printSlikAnalyze.ts
import { IFacilities, ISlikResult } from "../../libs/IInterfaces";

const formatRp = (val: number) =>
  "Rp " + Number(val || 0).toLocaleString("id-ID");

const formatRpShort = (val: number) => {
  const n = Number(val || 0);
  if (Math.abs(n) >= 1_000_000_000)
    return "Rp " + (n / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + " M";
  if (Math.abs(n) >= 1_000_000)
    return "Rp " + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + " Jt";
  return formatRp(n);
};

const formatDate = (val: string | null) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const COLLECT_INFO: Record<
  number,
  { label: string; short: string; color: string }
> = {
  1: { label: "KOL 1 - Lancar", short: "Lancar", color: "#16a34a" },
  2: {
    label: "KOL 2 - Dalam Perhatian Khusus",
    short: "DPK",
    color: "#2563eb",
  },
  3: {
    label: "KOL 3 - Kurang Lancar",
    short: "Kurang Lancar",
    color: "#ca8a04",
  },
  4: { label: "KOL 4 - Diragukan", short: "Diragukan", color: "#ea580c" },
  5: { label: "KOL 5 - Macet", short: "Macet", color: "#dc2626" },
};

const getCollectInfo = (collect: number) =>
  COLLECT_INFO[collect] || {
    label: `KOL ${collect}`,
    short: `KOL ${collect}`,
    color: "#475569",
  };

const getGradeInfo = (score: number) => {
  if (score >= 85)
    return {
      grade: "A",
      color: "#16a34a",
      bg: "#f0fdf4",
      status: "Sangat Baik",
    };
  if (score >= 70)
    return { grade: "B", color: "#2563eb", bg: "#eff6ff", status: "Baik" };
  if (score >= 50)
    return {
      grade: "C",
      color: "#ca8a04",
      bg: "#fefce8",
      status: "Cukup / Perhatian",
    };
  if (score >= 30)
    return {
      grade: "D",
      color: "#ea580c",
      bg: "#fff7ed",
      status: "Kurang Baik",
    };
  return {
    grade: "E",
    color: "#dc2626",
    bg: "#fef2f2",
    status: "Risiko Tinggi",
  };
};

const escapeHtml = (val: unknown) =>
  String(val ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );

// Rule dengan indikasi negatif (tunggakan/macet/melebihi limit) ditandai merah,
// selebihnya (informasi/positif) ditandai biru. Satu daftar bisa berisi campuran keduanya.
const isNegativeRule = (msg: string) => {
  const m = msg.toLowerCase();
  return (
    m.includes("macet") || m.includes("tunggakan") || m.includes("melebihi")
  );
};

const generate = (record: ISlikResult, score: number, rules: string[]) => {
  const gradeInfo = getGradeInfo(score);
  const summary = record.summary;
  const facilities: IFacilities[] = record.facilities || [];

  const reportId = `SLK-${new Date().getTime().toString().slice(-8)}`;
  const generatedAt = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Kategorikan fasilitas persis seperti logika pada dashboard
  const facilitiesWithMeta = facilities.map((f) => ({
    ...f,
    isActive: f.status === true,
    isProblem: f.collect >= 3,
    isInactive: f.status === false,
    ratio: f.plafond > 0 ? Math.min(100, (f.os / f.plafond) * 100) : 0,
  }));

  // Urutkan: yang bermasalah (kolektibilitas tertinggi) ditampilkan lebih dulu agar mudah diperiksa
  const sortedFacilities = [...facilitiesWithMeta].sort(
    (a, b) => b.collect - a.collect,
  );

  const segmentCards = [
    {
      label: "Fasilitas Aktif",
      icon: "●",
      accent: "#0891b2",
      bg: "#ecfeff",
      noa: summary.active_facilities_noa,
      plafond: summary.active_facilities_plafond,
      os: summary.active_facilities_os,
    },
    {
      label: "Fasilitas Bermasalah",
      icon: "▲",
      accent: "#dc2626",
      bg: "#fef2f2",
      noa: summary.problem_facilities_noa,
      plafond: summary.problem_facilities_plafond,
      os: summary.problem_facilities_os,
    },
    {
      label: "Historis / Non-Aktif",
      icon: "■",
      accent: "#64748b",
      bg: "#f8fafc",
      noa: summary.inactive_facilities_noa,
      plafond: summary.inactive_facilities_plafond,
      os: summary.inactive_facilities_os,
    },
  ];

  const renderFacilityRow = (f: (typeof facilitiesWithMeta)[number]) => {
    const collectInfo = getCollectInfo(f.collect);
    const badges = [
      f.isProblem
        ? `<span class="tag tag-danger">Bermasalah</span>`
        : f.isActive
          ? `<span class="tag tag-active">Aktif</span>`
          : `<span class="tag tag-muted">Selesai / Historis</span>`,
    ].join("");

    return `
      <tr>
        <td>
          <div class="fac-name">${escapeHtml(f.name || "Tidak diketahui")}</div>
          <div class="fac-condition">${escapeHtml(f.condition || "-")}</div>
          ${badges}
        </td>
        <td>
          <div class="ratio-row">
            <span class="ratio-os">${formatRpShort(f.os)}</span>
            <span class="ratio-sep">/</span>
            <span class="ratio-plafond">${formatRpShort(f.plafond)}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${f.ratio.toFixed(0)}%; background:${
              f.ratio > 80 ? "#dc2626" : f.ratio > 50 ? "#ca8a04" : "#2563eb"
            }"></div>
          </div>
        </td>
        <td>
          <span class="kol-dot" style="background:${collectInfo.color}"></span>
          <span class="kol-text" style="color:${collectInfo.color}">${collectInfo.label}</span>
        </td>
        <td>
          <span class="tag ${f.status ? "tag-active" : "tag-muted"}">${f.status ? "Aktif" : "Selesai"}</span>
        </td>
        <td class="fac-period">
          ${formatDate(f.start_at)}<br><span class="arrow">&rarr;</span> ${formatDate(f.end_at)}
        </td>
      </tr>`;
  };

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Analisa SLIK - ${escapeHtml(record.debitur?.fullname || "Debitur")}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 16mm 14mm 20mm 14mm;
        }
        :root {
            --ink: #0f172a;
            --sub: #64748b;
            --line: #e2e8f0;
            --brand: #1d4ed8;
        }
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, Cambria,"Segoe UI", "Inter", Roboto, Arial, sans-serif;
            color: var(--ink);
            line-height: 1.5;
            font-size: 11px;
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ===== Header / Letterhead ===== */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            margin-bottom: 16px;
            border-bottom: 3px solid var(--ink);
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
            width: 34px; height: 34px; border-radius: 8px;
            background: linear-gradient(135deg, #1d4ed8, #0891b2);
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: bold; font-size: 15px;
        }
        .brand-title h1 { margin: 0; font-size: 16px; letter-spacing: -0.2px; color: var(--ink); }
        .brand-title p { margin: 1px 0 0; font-size: 9.5px; color: var(--sub); }
        .header-meta { text-align: right; font-size: 9.5px; color: var(--sub); }
        .header-meta .rid { font-weight: bold; color: var(--ink); font-size: 11px; }

        /* ===== Hero: Debtor + Score ===== */
        .hero {
            display: grid;
            grid-template-columns: 1fr 260px;
            gap: 14px;
            margin-bottom: 16px;
        }
        .card {
            border: 1px solid var(--line);
            border-radius: 8px;
            background: #fff;
            padding: 14px;
        }
        .section-title {
            font-size: 10.5px;
            font-weight: 700;
            color: var(--ink);
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin: 0 0 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .section-title:before {
            content: "";
            width: 3px; height: 12px;
            background: var(--brand);
            border-radius: 2px;
            display: inline-block;
        }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item .k { font-size: 9px; color: var(--sub); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
        .info-item .v { font-size: 11.5px; font-weight: 700; color: var(--ink); }
        .info-item.full { grid-column: 1 / -1; }
        .info-item .v.small { font-weight: 500; font-size: 10.5px; }

        .score-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .score-ring {
            width: 92px; height: 92px; border-radius: 50%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border: 7px solid ${gradeInfo.color};
            background: ${gradeInfo.bg};
            margin-bottom: 8px;
        }
        .score-ring .g { font-size: 26px; font-weight: 800; color: ${gradeInfo.color}; line-height: 1; }
        .score-ring .n { font-size: 9px; color: var(--sub); margin-top: 2px; }
        .score-status {
            font-size: 11.5px; font-weight: 700; color: ${gradeInfo.color};
            text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
        }
        .score-foot { font-size: 9.5px; color: var(--sub); }
        .score-foot b { color: var(--ink); }

        /* ===== Executive summary metrics ===== */
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        .metric-card {
            border: 1px solid var(--line);
            border-top: 3px solid var(--brand);
            border-radius: 6px;
            padding: 9px 10px;
            background: #f8fafc;
        }
        .metric-card.warn { border-top-color: #ca8a04; }
        .metric-card.danger { border-top-color: #dc2626; background: #fef2f2; }
        .metric-card.ok { border-top-color: #16a34a; }
        .metric-label { font-size: 8.5px; color: var(--sub); text-transform: uppercase; font-weight: 700; margin-bottom: 3px; letter-spacing: 0.3px; }
        .metric-value { font-size: 13px; font-weight: 800; color: var(--ink); }

        /* ===== Segment summary cards ===== */
        .segment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .segment-card {
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 10px 12px;
            background: #fff;
        }
        .segment-head { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .segment-icon { font-size: 9px; }
        .segment-name { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px; }
        .segment-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 3px 0; color: var(--sub); }
        .segment-row b { color: var(--ink); font-weight: 700; }

        /* ===== Table ===== */
        .data-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .data-table thead { display: table-header-group; }
        .data-table th {
            background: var(--ink);
            text-align: left;
            padding: 7px 9px;
            font-weight: 700;
            color: #fff;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .data-table td {
            padding: 7px 9px;
            border-bottom: 1px solid var(--line);
            font-size: 9.8px;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) { background: #f8fafc; }
        .fac-name { font-weight: 700; color: var(--ink); }
        .fac-condition { font-size: 8.3px; color: var(--sub); font-style: italic; margin: 1px 0 3px; }
        .fac-period { font-size: 8.8px; color: var(--sub); white-space: nowrap; }
        .fac-period .arrow { color: #cbd5e1; }

        .ratio-row { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 3px; }
        .ratio-os { font-weight: 700; color: var(--ink); }
        .ratio-sep { color: #cbd5e1; }
        .ratio-plafond { color: var(--sub); }
        .bar-track { height: 5px; border-radius: 3px; background: #e2e8f0; overflow: hidden; width: 110px; }
        .bar-fill { height: 100%; border-radius: 3px; }

        .kol-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
        .kol-text { font-weight: 700; font-size: 9.3px; }

        .tag {
            display: inline-block;
            padding: 1.5px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        .tag-active { background: #dcfce7; color: #15803d; }
        .tag-danger { background: #fee2e2; color: #b91c1c; margin-left: 4px; }
        .tag-muted { background: #f1f5f9; color: #475569; }

        /* ===== Risk notes ===== */
        .risk-card { border: 1px solid var(--line); background: #fff; border-radius: 8px; padding: 14px; margin-top: 16px; }
        .rules-list { margin: 0; padding-left: 0; list-style: none; }
        .rules-list li {
            position: relative;
            padding: 6px 0 6px 22px;
            font-size: 10px;
            color: var(--ink);
            border-bottom: 1px dashed var(--line);
        }
        .rules-list li:last-child { border-bottom: none; }
        .rules-list li:before {
            position: absolute; left: 0; top: 6px;
            width: 12px; height: 12px; border-radius: 50%;
            color: #fff;
            font-size: 8px; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            line-height: 12px; text-align: center;
        }

        /* Peringatan risiko (mis. tunggakan, macet, melebihi limit) */
        .rules-list li.item-danger { color: #7f1d1d; }
        .rules-list li.item-danger:before { content: "!"; background: #dc2626; }

        /* Catatan informasi netral / positif */
        .rules-list li.item-info { color: #1e3a5f; }
        .rules-list li.item-info:before { content: "i"; background: #2563eb; }

        .no-rules { font-size: 10px; color: var(--sub); font-style: italic; padding: 4px 0; }

        .disclaimer {
            margin-top: 18px;
            padding-top: 8px;
            border-top: 1px solid var(--line);
            font-size: 8.3px;
            color: #94a3b8;
            line-height: 1.5;
        }

        .section-block { margin-bottom: 16px; }

        @media print {
            body { background: #fff; }
            .card, .metric-card, .segment-card, .data-table tr, .risk-card { page-break-inside: avoid; }
            .data-table thead { display: table-header-group; }
        }
    </style>
</head>
<body>

    <!-- Letterhead -->
    <div class="header">
        <div class="brand">
            <div class="brand-mark">S</div>
            <div class="brand-title">
                <h1>Laporan Analisa Kelayakan Kredit</h1>
                <p>Automated SLIK Credit Scoring &amp; Portfolio Assessment</p>
            </div>
        </div>
        <div class="header-meta">
            <div class="rid">${reportId}</div>
            <div>Dicetak: ${generatedAt}</div>
        </div>
    </div>

    <!-- Debtor profile + score -->
    <div class="hero">
        <div class="card">
            <div class="section-title">Profil Debitur</div>
            <div class="info-grid">
                <div class="info-item full">
                    <div class="k">Nama Lengkap</div>
                    <div class="v">${escapeHtml(record.debitur?.fullname || "-")}</div>
                </div>
                <div class="info-item">
                    <div class="k">NIK / KTP</div>
                    <div class="v">${escapeHtml(record.debitur?.nik || "-")}</div>
                </div>
                <div class="info-item">
                    <div class="k">NPWP</div>
                    <div class="v">${escapeHtml(record.debitur?.npwp || "-")}</div>
                </div>
                <div class="info-item full">
                    <div class="k">Alamat Domisili</div>
                    <div class="v small">${escapeHtml(record.debitur?.address || "-")}</div>
                </div>
            </div>
        </div>

        <div class="card score-card">
            <div class="section-title" style="align-self:flex-start;">Skor Sistem</div>
            <div class="score-ring">
                <span class="g">${gradeInfo.grade}</span>
                <span class="n">${score} / 100</span>
            </div>
            <div class="score-status">${gradeInfo.status}</div>
            <div class="score-foot">
                Kolektibilitas Tertinggi<br>
                <b>${getCollectInfo(summary.collect).label}</b>
            </div>
        </div>
    </div>

    <!-- Executive summary -->
    <div class="section-block">
        <div class="section-title">Ringkasan Eksposur Kredit</div>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Plafon</div>
                <div class="metric-value">${formatRpShort(summary.total_plafond)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Baki Debet (OS)</div>
                <div class="metric-value">${formatRpShort(summary.total_os)}</div>
            </div>
            <div class="metric-card ok">
                <div class="metric-label">Fasilitas Lunas (NOA)</div>
                <div class="metric-value">${summary.paid_facilities_noa} Kontrak</div>
            </div>
            <div class="metric-card ${summary.problem_facilities_noa > 0 ? "danger" : ""}">
                <div class="metric-label">Total Fasilitas</div>
                <div class="metric-value">${summary.total_facilities} Kontrak</div>
            </div>
        </div>
    </div>

    <!-- Segmentation -->
    <div class="section-block">
        <div class="section-title">Segmentasi Portofolio</div>
        <div class="segment-grid">
            ${segmentCards
              .map(
                (s) => `
            <div class="segment-card">
                <div class="segment-head">
                    <span class="segment-icon" style="color:${s.accent}">${s.icon}</span>
                    <span class="segment-name" style="color:${s.accent}">${s.label}</span>
                </div>
                <div class="segment-row"><span>Jumlah Kontrak</span><b>${s.noa}</b></div>
                <div class="segment-row"><span>Total Plafon</span><b>${formatRpShort(s.plafond)}</b></div>
                <div class="segment-row"><span>Baki Debet (OS)</span><b>${formatRpShort(s.os)}</b></div>
            </div>`,
              )
              .join("")}
        </div>
    </div>

    <!-- Facilities table -->
    <div class="section-block">
        <div class="section-title">Rincian Komprehensif Fasilitas Kredit (${facilities.length})</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 27%;">Lembaga Pembiayaan / Bank</th>
                    <th style="width: 22%;">Plafon &amp; Outstanding</th>
                    <th style="width: 20%;">Kolektibilitas</th>
                    <th style="width: 11%;">Status</th>
                    <th style="width: 20%;">Tenor Berjalan</th>
                </tr>
            </thead>
            <tbody>
                ${
                  sortedFacilities.length > 0
                    ? sortedFacilities.map(renderFacilityRow).join("")
                    : '<tr><td colspan="5" style="text-align:center; color:#94a3b8; font-style:italic; padding: 18px;">Tidak ditemukan rekam data fasilitas kredit pada instrumen ini.</td></tr>'
                }
            </tbody>
        </table>
    </div>

    <!-- Risk notes -->
    ${
      rules && rules.filter(Boolean).length > 0
        ? `
    <div class="risk-card">
        <div class="section-title">Catatan Manajemen Risiko &amp; Indikasi Pelanggaran Aturan</div>
        <ul class="rules-list">
            ${rules
              .filter(Boolean)
              .map(
                (r) =>
                  `<li class="${isNegativeRule(r) ? "item-danger" : "item-info"}">${escapeHtml(r)}</li>`,
              )
              .join("")}
        </ul>
    </div>`
        : `
    <div class="section-block">
        <div class="section-title">Catatan Manajemen Risiko</div>
        <div class="no-rules">Tidak ada catatan pelanggaran rule spesifik yang terdeteksi pada data ini.</div>
    </div>`
    }

    <div class="disclaimer">
        Laporan ini dihasilkan secara otomatis oleh sistem SLIK Credit Scoring Analyzer berdasarkan data yang diekstraksi dari dokumen SLIK OJK / iDeb yang diunggah.
        Hasil penilaian bersifat indikatif dan tidak menggantikan analisis kredit manual oleh pejabat berwenang. ID Laporan: ${reportId}.
    </div>

</body>
</html>
  `;
};

export const printAnalyzeSlik = (
  record: ISlikResult,
  score: number,
  rules: string[],
) => {
  const htmlContent = generate(record, score, rules);
  const w = window.open("", "_blank");

  if (!w) {
    alert(
      "Popup diblokir. Mohon izinkan popup dari pengaturan browser Anda untuk mencetak.",
    );
    return;
  }

  w.document.open();
  w.document.write(htmlContent);
  w.document.close();

  w.onload = function () {
    setTimeout(() => {
      w.focus();
      w.print();
    }, 700);
  };
};
