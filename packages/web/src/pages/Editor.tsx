import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import ResumePreview from "../components/resume/ResumePreview";
import ChatPanel from "../components/chat/ChatPanel";
import type { ResumeData, TemplateId, ThemeConfig } from "@resume-gen/shared";
import { DEFAULT_THEME, deriveThemeConfig } from "@resume-gen/shared";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>("modern");
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = useCallback(async (format: "pdf" | "docx") => {
    if (!user || !id) return;
    setDownloading(format);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/resumes/${id}/download/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "resume"}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(null);
    }
  }, [user, id, title]);

  useEffect(() => {
    if (!user || !id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "resumes", id),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setResumeData(data.resumeData as ResumeData | null);
          setTemplateId(data.templateId as TemplateId);
          if (data.themeConfig) {
            setThemeConfig(data.themeConfig as ThemeConfig);
          } else {
            setThemeConfig(deriveThemeConfig(data.templateId as TemplateId));
          }
          setTitle(data.title);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, id]);

  const handleResumeUpdate = (data: Record<string, unknown>) => {
    setResumeData(data as unknown as ResumeData);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-dark">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading === "pdf" ? "..." : "PDF"}
          </button>
          <button
            onClick={() => handleDownload("docx")}
            disabled={downloading !== null}
            className="flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading === "docx" ? "..." : "DOCX"}
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {resumeData ? (
            <ResumePreview data={resumeData} themeConfig={themeConfig} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-400">No resume data yet</p>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="w-96 border-l border-gray-200 bg-white">
          {id && (
            <ChatPanel
              resumeId={id}
              onResumeUpdate={handleResumeUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
