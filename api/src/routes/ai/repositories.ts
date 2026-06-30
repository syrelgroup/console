import { type Response, type Request } from "express";
import { ResponseServer } from "../../libs/util.js";
import { ExtractText } from "../../services/slik/parsepdf.js";
import {
  RuleCollect,
  RuleCountFacilities,
  RuleOutstanding,
  RuleProblemFacilities,
} from "../../services/slik/rules.js";

export const GETSLIKSUMMARY = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Mohon unggah sebuah file dan masukkan input pengguna!",
    });
  }

  try {
    const summaryData = await ExtractText(req.file.buffer);

    const [collect, countfas, problemfas, os] = [
      RuleCollect(summaryData, 1, 20),
      RuleCountFacilities(summaryData, 0, 2, 10),
      RuleProblemFacilities(summaryData, false, 0, 30),
      RuleOutstanding(summaryData, 50000000, 10),
    ];

    const result = [collect, countfas, problemfas, os];
    let score = 100;
    for (const rule of result) {
      if (rule?.status) score += rule.score;
      score -= rule?.score;
    }
    return ResponseServer(res, 200, {
      msg: "OK",
      data: summaryData,
      rulesmessage: result.map((r) => r?.msg),
      score: score > 100 ? 100 : score,
    });
  } catch (error) {
    console.error("Error processing OCR:", error);
    return ResponseServer(res, 500, {
      msg: "Terjadi kesalahan saat memproses OCR.",
    });
  }
};
