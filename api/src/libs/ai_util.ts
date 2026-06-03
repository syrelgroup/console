import {
  getLongRunningPoller,
  isUnexpected,
  type AnalyzeOperationOutput,
} from "@azure-rest/ai-document-intelligence";
import { aiClient, docClient, open_ai_model } from "./azure.js";
import {
  systempromtocr,
  systempromtslik,
  systempromtverif,
} from "./systempromt.js";
import { userpromtocr, userpromtslik, userpromtverif } from "./userpromt.js";

export async function ExtractDocument(fileBuffer: Buffer) {
  const initialResponse = await docClient
    .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
    .post({
      contentType: "application/octet-stream",
      body: fileBuffer,
      queryParameters: {
        features: ["keyValuePairs"],
      },
    });

  if (isUnexpected(initialResponse)) throw initialResponse.body.error;

  const poller = getLongRunningPoller(docClient, initialResponse);
  const docResult = (await poller.pollUntilDone())
    .body as AnalyzeOperationOutput;

  const analyzeResult = docResult.analyzeResult;

  const paragraphs =
    analyzeResult?.paragraphs
      ?.map((p: any) => p.content)
      .filter(Boolean)
      .join("\n") || "";

  const tables =
    analyzeResult?.tables
      ?.map((table: any, tableIndex: number) => {
        const rows: Record<number, string[]> = {};

        table.cells?.forEach((cell: any) => {
          const row = cell.rowIndex ?? 0;
          if (!rows[row]) rows[row] = [];
          rows[row][cell.columnIndex ?? 0] = cell.content || "";
        });

        return [
          `TABLE ${tableIndex + 1}`,
          ...Object.keys(rows).map((rowIndex) =>
            rows[Number(rowIndex)].join(" | "),
          ),
        ].join("\n");
      })
      .join("\n\n") || "";

  const keyValuePairs =
    analyzeResult?.keyValuePairs
      ?.map((kv: any) => {
        const key = kv.key?.content || "";
        const value = kv.value?.content || "";
        return `${key}: ${value}`;
      })
      .filter(Boolean)
      .join("\n") || "";

  const rawText = [
    "PARAGRAPHS:",
    paragraphs,
    "KEY VALUE PAIRS:",
    keyValuePairs,
    "TABLES:",
    tables,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!rawText.trim()) throw new Error("Document text not found");

  return rawText;
}

export async function GetOCRDocument(rawtext: string) {
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
    temperature: 0.2,
  });

  const llmAnswer = chatResponse.choices[0].message.content?.trim() || "{}";

  const finalJson = JSON.parse(llmAnswer);
  return finalJson;
}

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

export async function GetSlikSummary(rawtext: string) {
  const chatResponse = await aiClient.chat.completions.create({
    model: open_ai_model,
    messages: [
      {
        role: "system",
        content: systempromtslik,
      },
      { role: "user", content: userpromtslik(rawtext) },
    ],
    response_format: {
      type: "json_object",
    },
    temperature: 0.5,
  });

  const llmAnswer = chatResponse.choices[0].message.content?.trim() || "{}";

  const finalJson = JSON.parse(llmAnswer);
  return finalJson;
}
