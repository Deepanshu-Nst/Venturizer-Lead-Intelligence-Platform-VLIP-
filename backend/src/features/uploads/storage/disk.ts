import { writeFile, readFile, unlink, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, extname } from "node:path";
import type { StorageEngine, StoredFile } from "./types.js";

export class DiskStorage implements StorageEngine {
  private basePath: string;
  private baseUrl: string;

  constructor(basePath: string, baseUrl = "/api/v1/uploads/file") {
    this.basePath = basePath;
    this.baseUrl = baseUrl;
  }

  async save(filename: string, buffer: Buffer, _mimeType: string): Promise<StoredFile> {
    await mkdir(this.basePath, { recursive: true });
    const key = `${crypto.randomUUID()}${extname(filename)}`;
    const fullPath = join(this.basePath, key);
    await writeFile(fullPath, buffer);

    return {
      key,
      url: `${this.baseUrl}/${key}`,
      bucket: this.basePath,
    };
  }

  async get(key: string): Promise<Buffer> {
    const fullPath = join(this.basePath, key);
    return readFile(fullPath);
  }

  getStream(key: string): Promise<NodeJS.ReadableStream> {
    const fullPath = join(this.basePath, key);
    return Promise.resolve(createReadStream(fullPath));
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(this.basePath, key);
    await unlink(fullPath).catch(() => {});
  }

  getUrl(key: string): string | null {
    return `${this.baseUrl}/${key}`;
  }
}
