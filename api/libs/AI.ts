import { AzureOpenAI } from "openai";

export const ai_model = process.env.OPEN_AI_MODEL!;
const ai_endpoint = process.env.OPEN_AI_ENDPOINT!;
const ai_key = process.env.OPEN_AI_KEY!;
const ai_version = process.env.OPEN_AI_VERSION!;

export const aiClient = new AzureOpenAI({
  endpoint: ai_endpoint,
  apiKey: ai_key,
  apiVersion: ai_version,
});
