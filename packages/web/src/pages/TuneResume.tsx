import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResumes } from "../hooks/useResumes";
import { apiPost } from "../lib/api";
import type { Resume } from "@resume-gen/shared";

export default function TuneResume() {
  const navigate = useNavigate();
  const { resumes, loading } = useResumes();
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [jobPosting, setJobPosting] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedResumes = resumes.filter((r) => r.status === "complete");

  const handleTune = async () => {
    if (generating) return;
    if (!selectedResume || !jobPosting.trim()) {
      setError("Please select a resume and paste a job posting");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const sourceResume = resumes.find((r) => r.id === selectedResume);
      if (!sourceResume) throw new Error("Resume not found");

      // Create a new resume in tune mode
      const newResume = await apiPost<{ id: string }>("/resumes", {
        title: `${sourceResume.title} (Tuned)`,
        templateId: sourceResume.templateId,
        mode: "tune",
        jobPosting: jobPosting.trim(),
        inputSources: [
          {
            type: "text",
            content: JSON.stringify(sourceResume.resumeData),
          },
        ],
      });

      // Generate tuned version
      await apiPost(`/resumes/${newResume.id}/generate`);
      navigate(`/editor/${newResume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to tune resume");
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-coral border-t-transparent" />
        <p className="mt-4 text-lg font-medium text-dark">Tuning your resume...</p>
        <p className="mt-1 text-sm text-gray-500">Tailoring for the job posting</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-dark">Fine-Tune for Job</h1>
      <p className="mt-1 text-sm text-gray-500">
        Select an existing resume and paste a job posting to create a tailored version
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* Resume selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select a resume to tune
          </label>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-coral border-t-transparent" />
            </div>
          ) : completedResumes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No completed resumes found. Create one first.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {completedResumes.map((resume) => (
                <button
                  key={resume.id}
                  onClick={() => setSelectedResume(resume.id)}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    selectedResume === resume.id
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-dark">{resume.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {resume.templateId} template
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job posting */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Job Posting
          </label>
          <textarea
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            rows={10}
            placeholder="Paste the job posting text here..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-dark placeholder-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleTune}
            disabled={generating || !selectedResume || !jobPosting.trim()}
            className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
          >
            Tune Resume (1 credit)
          </button>
        </div>
      </div>
    </div>
  );
}
