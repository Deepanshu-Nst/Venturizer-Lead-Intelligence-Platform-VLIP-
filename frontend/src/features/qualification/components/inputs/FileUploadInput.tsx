import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FileUploadInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  accept?: string;
  label?: string;
  disabled?: boolean;
  documentType: "pitch-deck" | "investment-thesis";
}

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function FileUploadInput({
  value,
  onChange,
  accept = ".pdf",
  label = "Upload PDF",
  disabled,
  documentType,
}: FileUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setUploadState({ status: "error", progress: 0, error: "Only PDF files are allowed" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadState({ status: "error", progress: 0, error: "File exceeds 10MB limit" });
      return;
    }

    setUploadState({ status: "uploading", progress: 0 });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", documentType);

    try {
      const xhr = new XMLHttpRequest();

      const result = await new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadState((s) => ({ ...s, progress: pct }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data.file_id);
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.error?.message ?? "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("POST", "/api/v1/uploads/qualification");
        xhr.send(formData);
      });

      onChange(result);
      setUploadState({ status: "success", progress: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadState({ status: "error", progress: 0, error: message });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    onChange(null);
    setUploadState({ status: "idle", progress: 0 });
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20" aria-hidden>
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
          <div>
            <p className="text-[14px] font-bold text-white">PDF uploaded</p>
            <p className="text-[12px] font-medium text-emerald-400">Ready to submit</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-full p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200",
          dragOver
            ? "border-foreground bg-foreground/5"
            : uploadState.status === "uploading"
              ? "border-foreground/40 bg-foreground/5"
              : uploadState.status === "error"
                ? "border-accent/50 bg-accent/5"
                : "border-border hover:border-foreground/40 hover:bg-foreground/[0.02]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {uploadState.status === "uploading" ? (
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-foreground/60 animate-spin" aria-hidden />
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300 rounded-full"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Uploading... {uploadState.progress}%
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4" aria-hidden>
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{label}</p>
            <p className="text-xs text-muted-foreground text-center">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60">PDF only, max 10MB</p>
          </>
        )}
      </div>

      {uploadState.status === "error" && uploadState.error && (
        <p className="text-xs text-accent font-medium flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
          {uploadState.error}
        </p>
      )}
    </div>
  );
}
