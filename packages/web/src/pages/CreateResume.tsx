import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputSourceSelector from "../components/input/InputSourceSelector";
import StylePicker from "../components/resume/StylePicker";
import type { InputSource, ThemeConfig } from "@resume-gen/shared";
import { DEFAULT_THEME } from "@resume-gen/shared";
import { apiPost } from "../lib/api";

type Step = "input" | "template" | "generating";

export default function CreateResume() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("input");
  const [sources, setSources] = useState<InputSource[]>([]);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (generating) return;
    if (sources.length === 0) {
      setError("Please provide at least one input source");
      return;
    }

    setGenerating(true);
    setStep("generating");
    setError(null);

    try {
      // Create the resume
      const resume = await apiPost<{ id: string }>("/resumes", {
        title: "New Resume",
        templateId: themeConfig.layout,
        themeConfig,
        mode: "create",
        inputSources: sources,
      });

      // Generate with AI
      await apiPost(`/resumes/${resume.id}/generate`);

      navigate(`/editor/${resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setStep("template");
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Create New Resume</h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === "input"
            ? "Step 1: Provide your professional information"
            : step === "template"
              ? "Step 2: Choose your style"
              : "Generating your resume..."}
        </p>

        {/* Progress bar */}
        <div className="mt-4 flex gap-2">
          {["input", "template", "generating"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                i <=
                ["input", "template", "generating"].indexOf(step)
                  ? "bg-coral"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "input" && (
        <div className="space-y-6">
          <InputSourceSelector onSourcesChange={setSources} />
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (sources.length === 0) {
                  setError("Please provide at least one input source");
                  return;
                }
                setError(null);
                setStep("template");
              }}
              className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
            >
              Next: Choose Style
            </button>
          </div>
        </div>
      )}

      {step === "template" && (
        <div className="space-y-6">
          <StylePicker value={themeConfig} onChange={setThemeConfig} />
          <div className="flex justify-between">
            <button
              onClick={() => setStep("input")}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
            >
              Generate Resume (1 credit)
            </button>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-coral border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-dark">
            Generating your resume...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This may take a moment
          </p>
        </div>
      )}
    </div>
  );
}
