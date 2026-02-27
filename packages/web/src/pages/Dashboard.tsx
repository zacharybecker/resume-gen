import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { useResumes } from "../hooks/useResumes";
import { useResumeImport } from "../hooks/useResumeImport";
import { apiDelete, downloadResume } from "../lib/api";
import type { Resume } from "@resume-gen/shared";

function ResumeCard({ resume }: { resume: Resume }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  async function handleDelete() {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiDelete(`/resumes/${resume.id}`);
    } catch {
      alert("Failed to delete resume.");
      setDeleting(false);
    }
  }

  const handleDownload = useCallback(async (e: React.MouseEvent, format: "pdf" | "docx") => {
    e.preventDefault();
    if (!resume.id) return;
    setDownloading(format);
    try {
      await downloadResume(resume.id, format, resume.title || "resume");
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(null);
    }
  }, [resume.id, resume.title]);

  const statusColors = {
    draft: "bg-gray-100 text-gray-600",
    generating: "bg-yellow-100 text-yellow-700",
    complete: "bg-green-100 text-green-700",
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 transition-all hover:border-coral hover:shadow-md">
      <Link to={`/editor/${resume.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-dark group-hover:text-coral">
              {resume.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {resume.themeConfig
                ? `${resume.themeConfig.layout} layout · ${resume.themeConfig.colorScheme} scheme`
                : `${resume.templateId} template`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[resume.status]}`}
          >
            {resume.status}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span>{resume.mode === "tune" ? "Fine-tuned" : "Created"}</span>
          <span>&middot;</span>
          <span>
            {new Date(resume.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5">
        {resume.status === "complete" && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleDownload(e, "pdf")}
              disabled={downloading !== null}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-coral/10 hover:text-coral disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading === "pdf" ? "..." : "PDF"}
            </button>
            <button
              onClick={(e) => handleDownload(e, "docx")}
              disabled={downloading !== null}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-coral/10 hover:text-coral disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {downloading === "docx" ? "..." : "DOCX"}
            </button>
          </div>
        )}

        {/* Menu button */}
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(!menuOpen);
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-1 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { resumes, loading } = useResumes();
  const { importResume, importing, error: importError } = useResumeImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const result = await importResume(file);
    if (result) navigate(`/editor/${result.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">My Resumes</h1>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {importing ? "Importing..." : "Upload Resume"}
          </button>
          <Link
            to="/tune"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Fine-Tune for Job
          </Link>
          <Link
            to="/create"
            className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
          >
            New Resume
          </Link>
        </div>
      </div>

      {importError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {importError}
        </div>
      )}

      {importing ? (
        <div className="mt-12 flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-coral border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-dark">Importing your resume...</p>
          <p className="mt-1 text-sm text-gray-500">Parsing and generating — this may take a moment</p>
        </div>
      ) : loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-dark">
            No resumes yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first AI-powered resume in minutes.
          </p>
          <Link
            to="/create"
            className="mt-6 inline-block rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
          >
            Create your first resume
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
}
