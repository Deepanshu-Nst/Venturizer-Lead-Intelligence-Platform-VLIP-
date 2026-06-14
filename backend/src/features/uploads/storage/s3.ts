import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";
import type { StorageEngine, StoredFile } from "./types.js";

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  publicUrlBase?: string;
}

export class S3Storage implements StorageEngine {
  private client: S3Client;
  private bucket: string;
  private publicUrlBase: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: true,
    });
    this.bucket = config.bucket;
    this.publicUrlBase = config.publicUrlBase ?? "";
  }

  async save(filename: string, buffer: Buffer, mimeType: string): Promise<StoredFile> {
    const key = `${crypto.randomUUID()}-${filename}`;
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      },
    });

    await upload.done();

    return {
      key,
      url: this.getUrl(key),
      bucket: this.bucket,
    };
  }

  async get(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const response = await this.client.send(command);
    const body = response.Body;
    if (!body) return Buffer.alloc(0);
    const { transformToByteArray } = body as { transformToByteArray: () => Promise<Uint8Array> };
    return Buffer.from(await transformToByteArray());
  }

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const response = await this.client.send(command);
    return Readable.from(response.Body as Readable);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
    await this.client.send(command);
  }

  getUrl(key: string): string | null {
    if (this.publicUrlBase) {
      return `${this.publicUrlBase}/${key}`;
    }
    return null;
  }
}
