import type { TemplateDefinition } from "@resume-gen/shared";

interface TemplateCardProps {
  template: TemplateDefinition;
  selected: boolean;
  onClick: () => void;
}

export default function TemplateCard({
  template,
  selected,
  onClick,
}: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-lg border-2 p-1 text-left transition-all ${
        selected
          ? "border-coral shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Template preview */}
      <div
        className="flex h-48 items-end rounded-md p-4"
        style={{ backgroundColor: template.previewColor + "15" }}
      >
        <div className="w-full space-y-2">
          <div
            className="h-3 w-3/4 rounded"
            style={{ backgroundColor: template.previewColor + "40" }}
          />
          <div
            className="h-2 w-full rounded"
            style={{ backgroundColor: template.previewColor + "20" }}
          />
          <div
            className="h-2 w-5/6 rounded"
            style={{ backgroundColor: template.previewColor + "20" }}
          />
          <div
            className="h-2 w-2/3 rounded"
            style={{ backgroundColor: template.previewColor + "20" }}
          />
        </div>
      </div>

      {/* Template info */}
      <div className="p-3">
        <h3 className="font-semibold text-dark">{template.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{template.description}</p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-coral">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
