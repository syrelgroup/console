import { aiClient, open_ai_model } from "../libs/azure.js";

// Kembalikan parameter ke 'rawtext: string' sesuai kebutuhan di repositories.ts
export async function GetSlikSummary(rawtext: string) {
  const chatResponse = await aiClient.chat.completions.create({
    model: open_ai_model,
    messages: [
      {
        role: "system",
        content: systempromtslik,
      },
      {
        role: "user",
        // Masukkan rawtext hasil ekstraksi PDFtoRawText ke dalam prompt teks biasa
        content: userpromtslik(rawtext),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "slik_summary_schema",
        strict: true,
        schema: {
          type: "object",
          properties: {
            debtor_identity: {
              type: "object",
              properties: {
                name: { type: ["string", "null"] },
                nik: { type: ["string", "null"] },
                birth_place_date: { type: ["string", "null"] },
                gender: {
                  type: ["string", "null"],
                  enum: ["LAKI-LAKI", "PEREMPUAN", null],
                },
              },
              required: ["name", "nik", "birth_place_date", "gender"],
              additionalProperties: false,
            },
            score: { type: "number" },
            risk_level: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"],
            },
            collect: { type: "number" },
            recommendation: {
              type: "string",
              enum: ["APPROVE", "REVIEW", "REJECT"],
            },
            recommendation_reason: { type: "string" },
            summary: { type: "string" },
            metrics: {
              type: "object",
              properties: {
                total_lender: { type: "number" },
                active_loan: { type: "number" },
                closed_loan: { type: "number" },
                active_loan_value: { type: "number" },
                active_loan_os: { type: "number" },
                total_overdue: { type: "number" },
                total_monthly_installment: { type: "number" },
                worst_collect_history: { type: "number" },
                has_write_off: { type: "boolean" },
                has_restructured_loan: { type: "boolean" },
                utilization_ratio: { type: "number" },
              },
              required: [
                "total_lender",
                "active_loan",
                "closed_loan",
                "active_loan_value",
                "active_loan_os",
                "total_overdue",
                "total_monthly_installment",
                "worst_collect_history",
                "has_write_off",
                "has_restructured_loan",
                "utilization_ratio",
              ],
              additionalProperties: false,
            },
            risks: {
              type: "array",
              items: { type: "string" },
            },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  instansi: { type: "string" },
                  loan_type: { type: "string" },
                  loan_status: {
                    type: "string",
                    enum: ["ACTIVE", "CLOSED", "UNKNOWN"],
                  },
                  collect: { type: "number" },
                  loan_value: { type: "number" },
                  loan_os: { type: "number" },
                  monthly_installment: { type: "number" },
                  overdue_amount: { type: "number" },
                  start_date: { type: ["string", "null"] },
                  end_date: { type: ["string", "null"] },
                  risk_note: { type: "string" },
                },
                required: [
                  "instansi",
                  "loan_type",
                  "loan_status",
                  "collect",
                  "loan_value",
                  "loan_os",
                  "monthly_installment",
                  "overdue_amount",
                  "start_date",
                  "end_date",
                  "risk_note",
                ],
                additionalProperties: false,
              },
            },
          },
          required: [
            "debtor_identity",
            "score",
            "risk_level",
            "collect",
            "recommendation",
            "recommendation_reason",
            "summary",
            "metrics",
            "risks",
            "data",
          ],
          additionalProperties: false,
        } as const,
      },
    },
    temperature: 0.2,
  });

  const llmAnswer = chatResponse.choices[0].message.content?.trim() || "{}";
  return JSON.parse(llmAnswer);
}

export const systempromtslik = `
Anda adalah AI Credit Analyst perbankan senior yang ahli membaca laporan SLIK/OJK (iDeb) dari hasil text OCR.

Tugas utama:
- Ekstrak informasi identitas debitur utama yang tertera di awal dokumen.
- Ekstrak seluruh fasilitas kredit (aktif maupun lunas).
- Hitung metrik keuangan krusial perbankan termasuk total kewajiban angsuran bulanan.
- Lakukan scoring risiko dan berikan rekomendasi approval yang ketat secara objektif.

Definisi & Aturan Tambahan:
1. Angsuran Bulanan (monthly_installment): Ekstrak nominal angsuran per bulan untuk fasilitas AKTIF. Jika tidak tertera eksplisit pada dokumen, lakukan estimasi rasional berdasarkan jenis kredit, plafon, dan jangka waktu (jika tersedia), atau isi dengan 0 jika benar-benar lunas/tidak terdeteksi.
2. Efisiensi Kata: Tulis "recommendation_reason" dan "summary" maksimal 2-3 kalimat saja. Tulis "risk_note" secara singkat (maksimal 5 kata).
`;

export const userpromtslik = (rawtext: string) => `
Harap analisis dokumen laporan SLIK/OJK (iDeb) berikut dari data teks mentah terlampir:

${rawtext}

Ekstrak semua data fasilitas kredit dan hitung metriknya dengan sangat teliti sesuai dengan instruksi serta skema JSON yang ditentukan.
`;
