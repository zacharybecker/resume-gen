import { useState } from "react";
import FileUpload from "./FileUpload";
import TextInput from "./TextInput";
import type { InputSource } from "@resume-gen/shared";

interface InputSourceSelectorProps {
  onSourcesChange: (sources: InputSource[]) => void;
}

export default function InputSourceSelector({
  onSourcesChange,
}: InputSourceSelectorProps) {
  const [sources, setSources] = useState<InputSource[]>([]);
  const [freeText, setFreeText] = useState("");

  const handleFileProcessed = (result: {
    filename: string;
    content: string;
  }) => {
    const newSource: InputSource = {
      type: "upload",
      filename: result.filename,
      content: result.content,
    };
    const updated = [...sources, newSource];
    setSources(updated);
    onSourcesChange(buildSources(updated, freeText));
  };

  const handleTextChange = (text: string) => {
    setFreeText(text);
    onSourcesChange(buildSources(sources, text));
  };

  const removeSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated);
    onSourcesChange(buildSources(updated, freeText));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Upload Resume or LinkedIn Export
        </h3>
        <FileUpload onFileProcessed={handleFileProcessed} />
        {sources.length > 0 && (
          <div className="mt-3 space-y-2">
            {sources.map((source, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <span className="text-sm text-gray-700">
                  {source.filename || "Uploaded file"}
                </span>
                <button
                  onClick={() => removeSource(i)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">
            and / or
          </span>
        </div>
      </div>

      <TextInput value={freeText} onChange={handleTextChange} />
    </div>
  );
}

function buildSources(
  fileSources: InputSource[],
  freeText: string
): InputSource[] {
  const all = [...fileSources];
  if (freeText.trim()) {
    all.push({ type: "text", content: freeText.trim() });
  }
  return all;
}
