import { TEMPLATES, type TemplateId } from "@resume-gen/shared";
import TemplateCard from "./TemplateCard";

interface TemplateGalleryProps {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
}

export default function TemplateGallery({
  selected,
  onSelect,
}: TemplateGalleryProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-gray-700">
        Choose a template
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={selected === template.id}
            onClick={() => onSelect(template.id)}
          />
        ))}
      </div>
    </div>
  );
}
