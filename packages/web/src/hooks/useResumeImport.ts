import { useState } from "react";
import { apiUpload, apiPost } from "../lib/api";
import { DEFAULT_THEME } from "@resume-gen/shared";

interface ImportResult {
  id: string;
  title: string;
}

export function useResumeImport() {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importResume(file: File): Promise<ImportResult | null> {
    setImporting(true);
    setError(null);

    try {
      // 1. Upload & parse file
      const { filename, content } = await apiUpload<{
        filename: string;
        content: string;
      }>("/upload", file);

      // 2. Create resume draft
      const title =
        filename.replace(/\.(pdf|docx|txt)$/i, "") || "Imported Resume";
      const resume = await apiPost<{ id: string }>("/resumes", {
        title,
        templateId: DEFAULT_THEME.layout,
        themeConfig: DEFAULT_THEME,
        mode: "create",
        inputSources: [{ type: "upload" as const, filename, content }],
      });

      // 3. Generate with AI (costs 1 credit)
      await apiPost(`/resumes/${resume.id}/generate`);

      return { id: resume.id, title };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      return null;
    } finally {
      setImporting(false);
    }
  }

  return { importResume, importing, error };
}
