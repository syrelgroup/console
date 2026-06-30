// src/infrastructure/azure-openai.ts
import { AzureOpenAI } from "openai";

const config = {
  endpoint: process.env.OPEN_AI_ENDPOINT!,
  apikey: process.env.OPEN_AI_KEY!,
  model: process.env.OPEN_AI_MODEL!,
  version: process.env.OPEN_AI_VERSION!,
};

export class AzureOpenAIService {
  private client: AzureOpenAI;

  constructor() {
    this.client = new AzureOpenAI({
      endpoint: config.endpoint,
      apiKey: config.apikey,
      apiVersion: "2024-02-15-preview",
    });
  }

  async parseSlikPDF(pdfText: string): Promise<any> {
    const prompt = `Anda adalah sistem analisis SLIK (Sistem Layanan Informasi Keuangan) OJK.
Parse text SLIK berikut menjadi JSON dengan struktur yang sudah ditentukan.
Fokus pada:
1. Data nasabah (nama, NIK, NPWP, tanggal lahir)
2. Setiap fasilitas kredit (bank, jenis kredit, plafon, outstanding, kolektibilitas, tanggal)
3. Informasi DPK (tabungan, deposito, giro) jika ada
4. Riwayat pembayaran 12 bulan terakhir jika tersedia

Teks SLIK:
${pdfText.substring(0, 8000)} // Batasi token untuk hemat biaya

Response harus dalam format JSON valid tanpa markdown.`;

    const response = await this.client.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("Failed to parse SLIK data from AI response");
    }
  }

  async generateInsights(slikData: any): Promise<string> {
    const prompt = `Berdasarkan data SLIK berikut, berikan analisis mendalam tentang profil kredit nasabah, risiko utama, dan rekomendasi untuk bank. Gunakan bahasa Indonesia formal.

Data SLIK:
${JSON.stringify(slikData, null, 2)}

Berikan dalam format narasi yang profesional.`;

    const response = await this.client.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "";
  }
}
