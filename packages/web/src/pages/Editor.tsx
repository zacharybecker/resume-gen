import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import ResumePreview from "../components/resume/ResumePreview";
import ChatPanel from "../components/chat/ChatPanel";
import type { ResumeData, TemplateId } from "@resume-gen/shared";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>("modern");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "resumes", id),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setResumeData(data.resumeData as ResumeData | null);
          setTemplateId(data.templateId as TemplateId);
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
          <a
            href={`/api/resumes/${id}/download/pdf`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Download PDF
          </a>
          <a
            href={`/api/resumes/${id}/download/docx`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Download DOCX
          </a>
        </div>
      </div>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {resumeData ? (
            <ResumePreview data={resumeData} templateId={templateId} />
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
