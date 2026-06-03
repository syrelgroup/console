import fs from "fs";
import {
  ExtractDocument,
  GetOCRDocument,
  GetSlikSummary,
  GetVerifSummary,
} from "../../libs/ai_util.js";
const pdfPath = "./src/dokumen3.pdf";
// const pdfslikpath = "./src/slik.pdf";
const pdfslikpath = "./src/slikvasya.pdf";

export async function TestOCR() {
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ File ${pdfPath} tidak ditemukan.`);
    return;
  }

  const fileBuffer = fs.readFileSync(pdfPath);
  console.log(
    "⏳ Langkah 1: Membaca PDF menggunakan Azure Document Intelligence...",
  );

  const rawtext = await ExtractDocument(fileBuffer);
  const result = await GetOCRDocument(rawtext);

  console.log("⏳ Langkah 2: Memuat hasil OCR ...");

  console.log(result);
}

export async function TestAnalyzeKredit() {
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ File ${pdfPath} tidak ditemukan.`);
    return;
  }

  const fileBuffer = fs.readFileSync(pdfPath);
  console.log(
    "⏳ Langkah 1: Membaca PDF menggunakan Azure Document Intelligence...",
  );

  const rawtext = await ExtractDocument(fileBuffer);
  const ocrData = await GetOCRDocument(rawtext);

  console.log("⏳ Langkah 2: Memuat hasil OCR & Melakukan analisa data ...");

  const analyze = await GetVerifSummary(rawtext, ocrData);

  console.log(analyze);
}

export async function TestAnalyzeSlik() {
  if (!fs.existsSync(pdfslikpath)) {
    console.error(`❌ File ${pdfslikpath} tidak ditemukan.`);
    return;
  }

  const fileBuffer = fs.readFileSync(pdfslikpath);
  console.log(
    "⏳ Langkah 1: Membaca PDF menggunakan Azure Document Intelligence...",
  );

  const rawtext = await ExtractDocument(fileBuffer);
  // const ocrData = await GetOCRDocument(rawtext);

  console.log("⏳ Langkah 2: Memuat hasil OCR & Melakukan analisa data ...");

  const analyze = await GetSlikSummary(rawtext);

  console.log(analyze);
}
