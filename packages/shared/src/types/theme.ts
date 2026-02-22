export type LayoutId = "modern" | "classic" | "minimal" | "creative" | "executive" | "technical";
export type ColorSchemeId = "ocean" | "forest" | "slate" | "coral" | "midnight" | "terracotta" | "amethyst" | "espresso";
export type FontFamilyId = "sans" | "serif" | "mono";

export interface ThemeConfig {
  layout: LayoutId;
  colorScheme: ColorSchemeId;
  fontFamily: FontFamilyId;
}

export interface ColorPalette {
  primary: string;
  accent: string;
  headerBg: string;
  headerText: string;
  headerSubText: string;
  bodyText: string;
  subText: string;
  sectionBorder: string;
}

export interface FontSet {
  pdf: string;
  pdfBold: string;
  tailwind: string;
  docx: string;
}

export interface LayoutDefinition {
  id: LayoutId;
  name: string;
  description: string;
}

export interface ColorSchemeDefinition {
  id: ColorSchemeId;
  name: string;
  description: string;
  palette: ColorPalette;
}

export interface FontFamilyDefinition {
  id: FontFamilyId;
  name: string;
  description: string;
  sampleText: string;
}
