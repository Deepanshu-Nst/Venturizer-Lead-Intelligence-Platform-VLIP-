import type { TempFile } from "./upload.types.js";

const store = new Map<string, TempFile>();

export function addTempFile(fileId: string, file: TempFile): void {
  store.set(fileId, file);
}

export function consumeTempFile(fileId: string): TempFile | null {
  const file = store.get(fileId);
  if (!file) return null;
  store.delete(fileId);
  return file;
}
