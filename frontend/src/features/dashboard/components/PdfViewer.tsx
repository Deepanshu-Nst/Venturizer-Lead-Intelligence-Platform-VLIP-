import { useState } from "react";
import { FileText, Download, Eye, X } from "lucide-react";

interface PdfViewerProps {
  url: string;
  fileName: string;
  fileSize?: number | null;
}

export function PdfViewer({ url, fileName, fileSize }: PdfViewerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatSize = (bytes: number | null | undefined): string => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/5 shrink-0">
            <FileText className="h-4 w-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {fileName}
            </p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">{formatSize(fileSize)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
          <a
            href={url}
            download
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl h-[80vh] bg-background rounded-lg border border-border shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
              <span className="text-sm font-medium text-foreground truncate">
                {fileName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 bg-muted/20">
              <iframe
                src={url}
                className="w-full h-full rounded-b-lg"
                title={fileName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
