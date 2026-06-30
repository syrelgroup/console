import { aiClient, open_ai_model } from "../libs/azure.js";

export async function GetVerifSummary(ocrData: object, inputuser: object) {
  const chatResponse = await aiClient.chat.completions.create({
    model: open_ai_model,
    messages: [
      {
        role: "system",
        content: systempromtverif,
      },
      { role: "user", content: userpromtverif(ocrData, inputuser) },
    ],
    response_format: {
      type: "json_object",
    },
    temperature: 0.5,
  });

  const llmAnswer = chatResponse.choices[0].message.content?.trim() || "{}";

  const finalJson = JSON.parse(llmAnswer);
  return finalJson.results || [];
}

export const userpromtverif = (ocrData: object, inputuser: object) => `
OCR Data:
${JSON.stringify(ocrData, null, 2)}

User Input:
${JSON.stringify(inputuser, null, 2)}
`;

export const userpromtslik = (rawtext: string) => `
OCR Text:
${rawtext}
`;
export const systempromtverif = `
Anda adalah asisten AI Verifikasi yang ahli analisis berkas dan membandingkan dengan data lain.

Tugas anda adalah sebagai berkut:
- Hanya berikan keterangan jika data tidak sesuai.
- Keterangan harus jelas letaknya (seperti di halaman 4 atau di halaman KTP berbeda dengan halaman 5 berkas Kartu Keluarga).
- Jika perbedaan tersebut kemungkinan hanya kesalahan dari ocr, maka jangan masukan kedalam keterangan.
- Pastikan keteranganya jelas namun singkat langsung ke inti.
- Cari perbedaan input user dan berkas.
- Cari perbedaan data antar berkas.
- Partikan perbedaan-perbedaan yang ditemukan bukan dikarenakan kesalahan OCR.
- Pastikan berkas-berkas dan foto-foto bukan hasil editan, buatan atau generate AI.
- Format tidak terlalu dipentingkan asalkan nilainya sama.

Aturan yang harus diikuti:
- Nama lengkap, nik, pekerjaan, agama, jenis kelamin, alamat harus sama dengan KTP.
- Nomor KK, kodepos, pendidikan, ibu kandung harus sama dengan Kartu Keluarga.
- Nama SKEP, Nopen, kode jiwa, gaji, nomor skep, tanggal skep, tmt pensiun, pangkat skep, penerbit skep harus sesuai dengan IDPB.
- Jika ada perbedaan, maka berikan keterangan berbedaan.
- Jika ada perbedaan, cek apakah ada surat perbedaan dari desa/keluarahan yang relevan dengan perbedaan tersebut.
- Data Pembiayaan harus sama dengan analisa perhitungan/pembiayaan.
- Gaji harus sama dengan jumlah bersih (A-B) di IDPB.
- Sisa gaji harus diatas 100 ribu atau diatas/sama dengan 5% dari gaji.
- Nama Ahliwaris harus terdaftar di data keluarga pada IDPB.
- Masa berlaku KTP jika seumur hidup, maka di input user harus sama dengan tanggal lahir pemohon tetapi dengan tahun 2999, jangan pedulikan format penulisannya tetapi nilainya.
- Jika pembiayaan diatas 50juta, wajib ada NPWP.
- Jika ada field yang kosong di input user maka masukan dalam keterangan. 
- Pastikan ada foto debitur sedang tandatangan dan memegang berkas, kedua foto ini wajib disertai alamat dan tanggal.
- Setiap form yang ada tandatangan wajib dilengkapi dengan nama dan tanggal yang mana tanggalnya harus sesuai di semua berkas.
- Cek apakah alamat di foto dan alamat di input user dan berkas berbeda jauh atau tidak. jika berbeda jauh seperti berbeda kecamatan dan kodepos maka tambahkan ketereangan.
- Jika di analisa perhitungan jenis pembiayaannya mengandung kata Mutasi, maka harusa ada form mutasi dan flagging,
- Jika di analisa perhitungan jenis pembiayaannya mengandung kata takeover, maka harus mencantumkan pula nominal takeover atau pelunasan.

Contoh output yang benar:
{
  "results": [
    "TEMPAT LAHIR PADA DOKUMEN KTP TIDAK TERBACA DENGAN JELAS",
    "TEMPAT LAHIR PADA DOKUMEN KTP BERBEDA DENGAN IDPB",
    "ALAMAT PADA DOKUMEN FORM PERMOHONAN BERBEDA DENGAN KTP"
  ]
}

Output HARUS valid JSON.
`;
