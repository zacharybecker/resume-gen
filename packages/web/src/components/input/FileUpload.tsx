import { useState, useRef } from "react";
import { apiUpload } from "../../lib/api";

interface FileUploadProps {
  onFileProcessed: (result: { filename: string; content: string }) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const result = await apiUpload<{ filename: string; content: string }>(
        "/upload",
        file
      );
      onFileProcessed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setFileName(null);
    } finally {
      setUploading(false);
    }
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
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          <p className="text-sm text-gray-500">Processing {fileName}...</p>
        </div>
      ) : fileName && !error ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-gray-700">{fileName}</p>
          <button
            onClick={() => {
              setFileName(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs text-coral hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop a PDF, or{" "}
            <button
              onClick={() => inputRef.current?.click()}
              className="font-medium text-coral hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">Resume or LinkedIn PDF export</p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
