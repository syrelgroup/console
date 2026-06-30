import {
  getLongRunningPoller,
  isUnexpected,
  type AnalyzeOperationOutput,
} from "@azure-rest/ai-document-intelligence";
import { aiClient, docClient, open_ai_model } from "../libs/azure.js";
import { ocrschema } from "./schema.js";

export async function PDFtoRawText(fileBuffer: Buffer) {
  const initialResponse = await docClient
    .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
    .post({
      contentType: "application/octet-stream",
      body: fileBuffer,
    });

  if (isUnexpected(initialResponse)) throw initialResponse.body.error;

  const poller = getLongRunningPoller(docClient, initialResponse);
  const docResult = (await poller.pollUntilDone())
    .body as AnalyzeOperationOutput;

  const analyzeResult = docResult.analyzeResult;

  return analyzeResult;
}

export async function GenerateOCRFromRaw(rawtext: string) {
  const chatResponse = await aiClient.chat.completions.create({
    model: open_ai_model,
    messages: [
      {
        role: "system",
        content: systempromtocr,
      },
      { role: "user", content: userpromtocr(rawtext) },
    ],
    response_format: {
      type: "json_object",
    },
    // temperature: 0.2,
  });

  const llmAnswer = chatResponse.choices[0].message.content?.trim() || "{}";

  const finalJson = JSON.parse(llmAnswer);
  return finalJson;
}

export const systempromtocr = `
Kamu adalah AI extractor dokumen.

Rules:
- Output HARUS JSON valid
- Jangan beri markdown
- Jangan beri penjelasan
- Ikuti schema user
- Jika field tidak ada isi ""
- Normalisasi tanggal ke YYYY-MM-DD
- Prioritaskan data mengikuti IDPB, namun jika tidak ada maka gunakan KTP
- Outputnya jangan dirubah
- Output value Kapital semua
`;

export const userpromtocr = (rawtext: string) => `
Schema:
${JSON.stringify(ocrschema, null, 2)}

OCR Text:
${rawtext}
`;
