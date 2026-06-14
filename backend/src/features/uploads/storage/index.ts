import { config } from "../../../config/index.js";
import type { StorageEngine } from "./types.js";
import { DiskStorage } from "./disk.js";
import { S3Storage } from "./s3.js";

let instance: StorageEngine | null = null;

export function getStorageEngine(): StorageEngine {
  if (instance) return instance;

  if (config.storage.driver === "s3") {
    instance = new S3Storage({
      region: config.storage.s3.region,
      bucket: config.storage.s3.bucket,
      accessKeyId: config.storage.s3.accessKeyId,
      secretAccessKey: config.storage.s3.secretAccessKey,
      endpoint: config.storage.s3.endpoint,
      publicUrlBase: config.storage.s3.publicUrlBase,
    });
  } else {
    instance = new DiskStorage(config.storage.diskPath, "/api/v1/uploads/file");
  }

  return instance;
}

export type { StorageEngine, StoredFile } from "./types.js";
