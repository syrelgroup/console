import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const storage_account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const storage_accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const storage_containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

// BLOB STORAGE
let blobServiceClient: BlobServiceClient | null = null;
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
