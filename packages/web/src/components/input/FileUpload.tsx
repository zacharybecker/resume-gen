import { useState, useRef } from "react";
import { apiUpload } from "../../lib/api";

interface FileUploadProps {
  onFileProcessed: (result: { filename: string; content: string }) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      setError("Only PDF files are supported");
      return;
    }

    if (pdfFiles.length < files.length) {
      setError("Some non-PDF files were skipped");
    } else {
      setError(null);
    }

    setUploading(true);

    for (const file of pdfFiles) {
      try {
        const result = await apiUpload<{ filename: string; content: string }>(
          "/upload",
          file
        );
        onFileProcessed(result);
      } catch (err) {
        setError(
          `Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`
        );
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="relative rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-coral"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0)
            handleFiles(e.target.files);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          <p className="text-sm text-gray-500">Processing files...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop PDFs, or{" "}
            <button
              onClick={() => inputRef.current?.click()}
              className="font-medium text-coral hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Resume or LinkedIn PDF export (multiple files supported)
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
