import type { TemplateId } from "../types/resume.js";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  previewColor: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, minimal, sans-serif, subtle color accents",
    previewColor: "#4A90D9",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional, serif fonts, conservative layout",
    previewColor: "#2C3E50",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Maximum whitespace, ultra-clean",
    previewColor: "#7F8C8D",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold typography, unique layout elements",
    previewColor: "#E74C3C",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal, dense, leadership-focused",
    previewColor: "#1A1A2E",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Skills-heavy, project-focused, monospace accents",
    previewColor: "#27AE60",
  },
];
