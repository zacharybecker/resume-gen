import { useState } from "react";
import type { ThemeConfig } from "@resume-gen/shared";
import { LAYOUTS, COLOR_SCHEMES, FONT_FAMILIES } from "@resume-gen/shared";
import { apiUpload } from "../../lib/api";

interface StylePickerProps {
  value: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

export default function StylePicker({ value, onChange }: StylePickerProps) {
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleExtract = async (file: File) => {
    setExtracting(true);
    setExtractError(null);
    try {
      const result = await apiUpload<ThemeConfig>("/extract-theme", file);
      onChange(result);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Failed to extract theme");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme extraction upload */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Match an existing style <span className="text-gray-400">(optional)</span>
        </h3>
        <div
          className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-coral"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files[0]) handleExtract(e.dataTransfer.files[0]);
          }}
        >
          {extracting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-coral border-t-transparent" />
              <span className="text-sm text-gray-500">Analyzing style...</span>
            </div>
          ) : (
            <>
              <label className="cursor-pointer text-sm text-gray-600">
                Drop a resume image or PDF here, or{" "}
                <span className="font-medium text-coral hover:underline">browse</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleExtract(e.target.files[0]);
                  }}
                />
              </label>
              <p className="mt-1 text-xs text-gray-400">We'll detect the layout, colors, and font</p>
            </>
          )}
          {extractError && <p className="mt-2 text-xs text-red-500">{extractError}</p>}
        </div>
      </div>

      {/* Layout picker */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Layout</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => onChange({ ...value, layout: layout.id })}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                value.layout === layout.id
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-dark">{layout.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">{layout.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color scheme picker */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Color Scheme</h3>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => onChange({ ...value, colorScheme: scheme.id })}
              className={`group flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all ${
                value.colorScheme === scheme.id
                  ? "border-coral"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex gap-0.5">
                <div
                  className="h-8 w-4 rounded-l-md"
                  style={{ backgroundColor: scheme.palette.primary }}
                />
                <div
                  className="h-8 w-4 rounded-r-md"
                  style={{ backgroundColor: scheme.palette.accent }}
                />
              </div>
              <span className="text-xs text-gray-600">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font picker */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-gray-700">Font</h3>
        <div className="grid grid-cols-3 gap-3">
          {FONT_FAMILIES.map((font) => (
            <button
              key={font.id}
              onClick={() => onChange({ ...value, fontFamily: font.id })}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                value.fontFamily === font.id
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className={`text-lg text-dark ${
                font.id === "sans" ? "font-sans" : font.id === "serif" ? "font-serif" : "font-mono"
              }`}>
                {font.sampleText}
              </p>
              <p className="mt-1 text-xs text-gray-500">{font.name} — {font.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
