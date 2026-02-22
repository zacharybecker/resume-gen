import { Link } from "react-router-dom";
import { useResumes } from "../hooks/useResumes";
import type { Resume } from "@resume-gen/shared";

function ResumeCard({ resume }: { resume: Resume }) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-600",
    generating: "bg-yellow-100 text-yellow-700",
    complete: "bg-green-100 text-green-700",
  };

  return (
    <Link
      to={`/editor/${resume.id}`}
      className="group block rounded-lg border border-gray-200 p-5 transition-all hover:border-coral hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-dark group-hover:text-coral">
            {resume.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {resume.templateId} template
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[resume.status]}`}
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
  );
}

export default function Dashboard() {
  const { resumes, loading } = useResumes();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">My Resumes</h1>
        <div className="flex items-center gap-3">
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

      {loading ? (
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
