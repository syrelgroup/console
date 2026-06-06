import { type Response, type Request } from "express";
import { ResponseServer } from "../../libs/util.js";
import {
  ExtractDocument,
  GetOCRDocument,
  GetSlikSummary,
  GetVerifSummary,
} from "../../libs/ai_util.js";

export const GETOCR = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "Mohon unggah sebuah file!" });
  }
  try {
    const rawdata = await ExtractDocument(req.file.buffer);
    const ocrData = await GetOCRDocument(rawdata);

    return ResponseServer(res, 200, { msg: "OK", data: ocrData });
  } catch (error) {
    console.error("Error processing OCR:", error);
    return ResponseServer(res, 500, {
      msg: "Terjadi kesalahan saat memproses OCR.",
    });
  }
};

export const GETVERIFYSUMMARY = async (req: Request, res: Response) => {
  const { user_input } = req.body;
  if (!req.file || !user_input) {
    return res.status(400).json({
      message: "Mohon unggah sebuah file dan masukkan input pengguna!",
    });
  }

  try {
    const rawdata = await ExtractDocument(req.file.buffer);
    const ocrData = await GetOCRDocument(rawdata);
    const summaryData = await GetVerifSummary(ocrData, JSON.parse(user_input));

    return ResponseServer(res, 200, { msg: "OK", data: summaryData });
  } catch (error) {
    console.error("Error processing OCR:", error);
    return ResponseServer(res, 500, {
      msg: "Terjadi kesalahan saat memproses OCR.",
    });
  }
};

export const GETSLIKSUMMARY = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Mohon unggah sebuah file dan masukkan input pengguna!",
    });
  }

  try {
    const rawdata = await ExtractDocument(req.file.buffer);
    // const ocrData = await GetOCRDocument(rawdata);
    const summaryData = await GetSlikSummary(rawdata);

    return ResponseServer(res, 200, { msg: "OK", data: summaryData });
  } catch (error) {
    console.error("Error processing OCR:", error);
    return ResponseServer(res, 500, {
      msg: "Terjadi kesalahan saat memproses OCR.",
    });
  }
};
