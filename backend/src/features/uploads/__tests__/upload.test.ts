import { describe, it, expect, beforeEach } from "vitest";
import { validateFileType, validateFileSize, validatePdfMagicBytes, validateDocumentType } from "../upload.validation.js";
import { addTempFile, consumeTempFile } from "../temp-store.js";

// ---------------------------------------------------------------------------
// File Validation Tests
// ---------------------------------------------------------------------------

describe("validateFileType", () => {
  it("accepts application/pdf", () => {
    expect(validateFileType("application/pdf").valid).toBe(true);
  });

  it("rejects non-PDF mime types", () => {
    expect(validateFileType("image/png").valid).toBe(false);
    expect(validateFileType("text/plain").valid).toBe(false);
    expect(validateFileType("application/octet-stream").valid).toBe(false);
  });
});

describe("validateFileSize", () => {
  it("accepts files within limit", () => {
    expect(validateFileSize(5 * 1024 * 1024).valid).toBe(true);
    expect(validateFileSize(1).valid).toBe(true);
  });

  it("rejects empty files", () => {
    const result = validateFileSize(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects files exceeding 10MB", () => {
    const result = validateFileSize(11 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10MB");
  });
});

describe("validatePdfMagicBytes", () => {
  it("accepts valid PDF header", () => {
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0x00]);
    expect(validatePdfMagicBytes(buffer).valid).toBe(true);
  });

  it("rejects non-PDF header", () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x00, 0x00]);
    const result = validatePdfMagicBytes(buffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid PDF");
  });

  it("rejects buffer smaller than 4 bytes", () => {
    const buffer = Buffer.from([0x25, 0x50]);
    const result = validatePdfMagicBytes(buffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too small");
  });

  it("rejects empty buffer", () => {
    const buffer = Buffer.alloc(0);
    const result = validatePdfMagicBytes(buffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("too small");
  });
});

describe("validateDocumentType", () => {
  it("accepts valid document types", () => {
    expect(validateDocumentType("pitch-deck").valid).toBe(true);
    expect(validateDocumentType("investment-thesis").valid).toBe(true);
    expect(validateDocumentType("other").valid).toBe(true);
  });

  it("rejects invalid document types", () => {
    const result = validateDocumentType("resume");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pitch-deck");
  });
});

// ---------------------------------------------------------------------------
// Temp Store Tests
// ---------------------------------------------------------------------------

describe("temp-store", () => {
  beforeEach(() => {
    // consume any leftover temp files
    while (consumeTempFile("x")) { /* clear */ }
  });

  it("stores and retrieves temp files", () => {
    addTempFile("test-1", {
      originalname: "deck.pdf",
      size: 5000,
      mimetype: "application/pdf",
      storageKey: "abc123",
    });

    const file = consumeTempFile("test-1");
    expect(file).not.toBeNull();
    expect(file?.originalname).toBe("deck.pdf");
    expect(file?.mimetype).toBe("application/pdf");
  });

  it("returns null for unknown file ID", () => {
    expect(consumeTempFile("nonexistent")).toBeNull();
  });

  it("deletes file after consumption", () => {
    addTempFile("single-use", {
      originalname: "once.pdf",
      size: 100,
      mimetype: "application/pdf",
      storageKey: "key-1",
    });

    consumeTempFile("single-use");
    expect(consumeTempFile("single-use")).toBeNull();
  });

  it("stores multiple files independently", () => {
    addTempFile("a", {
      originalname: "a.pdf",
      size: 100,
      mimetype: "application/pdf",
      storageKey: "key-a",
    });
    addTempFile("b", {
      originalname: "b.pdf",
      size: 200,
      mimetype: "application/pdf",
      storageKey: "key-b",
    });

    expect(consumeTempFile("a")?.originalname).toBe("a.pdf");
    expect(consumeTempFile("b")?.originalname).toBe("b.pdf");
  });
});

// ---------------------------------------------------------------------------
// Storage Engine Tests (DiskStorage)
// ---------------------------------------------------------------------------

describe("DiskStorage", () => {
  it("can be instantiated", async () => {
    const { DiskStorage } = await import("../storage/disk.js");
    const storage = new DiskStorage("/tmp/test-uploads");
    expect(storage).toBeDefined();
  });

  it("saves and retrieves a file", async () => {
    const { DiskStorage } = await import("../storage/disk.js");
    const storage = new DiskStorage("/tmp/test-uploads");

    const result = await storage.save(
      "test.pdf",
      Buffer.from([0x25, 0x50, 0x44, 0x46]),
      "application/pdf"
    );

    expect(result.key).toBeTruthy();
    expect(result.url).toContain("/api/v1/uploads/file/");

    const retrieved = await storage.get(result.key);
    expect(retrieved.length).toBe(4);
    expect(retrieved[0]).toBe(0x25);

    // Cleanup
    await storage.delete(result.key);
  });
});
