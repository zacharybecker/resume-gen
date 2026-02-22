import type {
  LayoutId,
  LayoutDefinition,
  ColorSchemeId,
  ColorSchemeDefinition,
  ColorPalette,
  FontFamilyId,
  FontFamilyDefinition,
  FontSet,
  ThemeConfig,
} from "../types/theme.js";
import type { TemplateId } from "../types/resume.js";

export const LAYOUTS: LayoutDefinition[] = [
  { id: "modern", name: "Modern", description: "Clean lines, subtle accents, professional yet contemporary" },
  { id: "classic", name: "Classic", description: "Traditional layout, conservative spacing, time-tested format" },
  { id: "minimal", name: "Minimal", description: "Maximum whitespace, ultra-clean, content-focused" },
  { id: "creative", name: "Creative", description: "Bold header, distinctive layout, stands out" },
  { id: "executive", name: "Executive", description: "Formal, dense, leadership-focused presentation" },
  { id: "technical", name: "Technical", description: "Skills-heavy, project-focused, developer-friendly" },
];

export const COLOR_SCHEMES: ColorSchemeDefinition[] = [
  {
    id: "ocean",
    name: "Ocean",
    description: "Professional blues",
    palette: {
      primary: "#2C5F8A",
      accent: "#4A90D9",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Fresh greens",
    palette: {
      primary: "#2D6A4F",
      accent: "#27AE60",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Understated grays",
    palette: {
      primary: "#64748B",
      accent: "#94A3B8",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "coral",
    name: "Coral",
    description: "Warm coral accents",
    palette: {
      primary: "#E8725C",
      accent: "#FF6B6B",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark header, bold contrast",
    palette: {
      primary: "#1A1A2E",
      accent: "#E8725C",
      headerBg: "#1A1A2E",
      headerText: "#FFFFFF",
      headerSubText: "rgba(255,255,255,0.8)",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Earthy warm tones",
    palette: {
      primary: "#C2703E",
      accent: "#E07C4F",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "amethyst",
    name: "Amethyst",
    description: "Creative purples",
    palette: {
      primary: "#7C3AED",
      accent: "#A78BFA",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "Classic warmth",
    palette: {
      primary: "#6B4226",
      accent: "#A0785A",
      headerBg: "#FFFFFF",
      headerText: "#1A1A1A",
      headerSubText: "#6B7280",
      bodyText: "#1A1A1A",
      subText: "#4B5563",
      sectionBorder: "#E5E7EB",
    },
  },
];

export const FONT_FAMILIES: FontFamilyDefinition[] = [
  { id: "sans", name: "Sans-serif", description: "Modern and clean", sampleText: "The quick brown fox" },
  { id: "serif", name: "Serif", description: "Traditional and formal", sampleText: "The quick brown fox" },
  { id: "mono", name: "Monospace", description: "Technical and precise", sampleText: "The quick brown fox" },
];

export const FONT_SETS: Record<FontFamilyId, FontSet> = {
  sans: { pdf: "Helvetica", pdfBold: "Helvetica-Bold", tailwind: "font-sans", docx: "Calibri" },
  serif: { pdf: "Times-Roman", pdfBold: "Times-Bold", tailwind: "font-serif", docx: "Times New Roman" },
  mono: { pdf: "Courier", pdfBold: "Courier-Bold", tailwind: "font-mono", docx: "Courier New" },
};

export function getColorPalette(schemeId: ColorSchemeId): ColorPalette {
  const scheme = COLOR_SCHEMES.find((s) => s.id === schemeId);
  return scheme ? scheme.palette : COLOR_SCHEMES[3].palette;
}

export function getFontSet(fontId: FontFamilyId): FontSet {
  return FONT_SETS[fontId] || FONT_SETS.sans;
}

export function deriveThemeConfig(templateId: TemplateId): ThemeConfig {
  const map: Record<TemplateId, ThemeConfig> = {
    modern: { layout: "modern", colorScheme: "coral", fontFamily: "sans" },
    classic: { layout: "classic", colorScheme: "slate", fontFamily: "serif" },
    minimal: { layout: "minimal", colorScheme: "slate", fontFamily: "sans" },
    creative: { layout: "creative", colorScheme: "coral", fontFamily: "sans" },
    executive: { layout: "executive", colorScheme: "midnight", fontFamily: "serif" },
    technical: { layout: "technical", colorScheme: "forest", fontFamily: "mono" },
  };
  return map[templateId] || map.modern;
}

export const DEFAULT_THEME: ThemeConfig = {
  layout: "modern",
  colorScheme: "coral",
  fontFamily: "sans",
};
