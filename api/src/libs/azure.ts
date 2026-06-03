import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import DocumentIntelligence from "@azure-rest/ai-document-intelligence";
import { AzureOpenAI } from "openai";

const storage_account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const storage_accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const storage_containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

const azure_ai_endpoint = process.env.AZURE_AI_ENDPOINT!;
const azure_ai_key = process.env.AZURE_AI_KEY!;

export const open_ai_model = process.env.OPEN_AI_MODEL!;
const open_ai_endpoint = process.env.OPEN_AI_ENDPOINT!;
const open_ai_key = process.env.OPEN_AI_KEY!;

// INITIALIZE
let blobServiceClient: BlobServiceClient | null = null;

export const docClient = DocumentIntelligence(azure_ai_endpoint, {
  key: azure_ai_key,
});
export const aiClient = new AzureOpenAI({
  endpoint: open_ai_endpoint,
  apiKey: open_ai_key,
  apiVersion: "2024-12-01-preview",
});
// END INITIALIZE

if (storage_account && storage_accountKey && storage_containerName) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    storage_account,
    storage_accountKey,
  );
  blobServiceClient = new BlobServiceClient(
    `https://${storage_account}.blob.core.windows.net`,
    sharedKeyCredential,
  );
}

export const getContainerClient = () => {
  if (!blobServiceClient) {
    throw new Error(
      "Azure Storage configuration is missing. Please set AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, and AZURE_STORAGE_CONTAINER_NAME environment variables.",
    );
  }
  return blobServiceClient.getContainerClient(storage_containerName);
};
