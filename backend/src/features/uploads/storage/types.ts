export interface StoredFile {
  key: string;
  url: string | null;
  bucket: string;
}

export interface StorageEngine {
  save(filename: string, buffer: Buffer, mimeType: string): Promise<StoredFile>;
  get(key: string): Promise<Buffer>;
  getStream(key: string): Promise<NodeJS.ReadableStream>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string | null;
}
