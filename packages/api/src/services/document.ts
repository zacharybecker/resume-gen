import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
import type { ResumeData, TemplateId } from "@resume-gen/shared";
import type { ThemeConfig } from "@resume-gen/shared";
import { getColorPalette, getFontSet, deriveThemeConfig } from "@resume-gen/shared";
import { createPdfDocument, createPdfDocumentFromTheme } from "./pdf-templates.js";

interface DocxTheme {
  font: string;
  headerBg: string | null; // null = no shading (white)
  headerText: string;
  headerSubText: string;
  accent: string;
  bodyText: string;
  subText: string;
  sectionBorder: string;
}

/**
 * Strip the leading "#" from a hex color string.
 * The docx library expects hex colors without the "#" prefix.
 * If the color uses rgba() format (not supported by docx), returns the fallback instead.
 */
function stripHash(color: string, fallback?: string): string {
  if (color.startsWith("rgba")) {
    return fallback ? stripHash(fallback) : "6B7280";
  }
  return color.startsWith("#") ? color.slice(1) : color;
}

/**
 * Resolve a ThemeConfig into a DocxTheme for use in DOCX generation.
 * Applies layout-specific header rules matching the PDF renderer logic.
 */
function resolveDocxTheme(themeConfig: ThemeConfig): DocxTheme {
  const palette = getColorPalette(themeConfig.colorScheme);
  const fontSet = getFontSet(themeConfig.fontFamily);

  let headerBg: string | null;
  let headerText: string;
  let headerSubText: string;

  switch (themeConfig.layout) {
    case "creative":
      headerBg = stripHash(palette.accent);
      headerText = "FFFFFF";
      headerSubText = "FFFFFF";
      break;
    case "executive":
      headerBg = stripHash(palette.primary);
      headerText = "FFFFFF";
      headerSubText = "FFFFFF";
      break;
    case "technical":
      headerBg = "111827";
      headerText = stripHash(palette.accent);
      headerSubText = stripHash(palette.accent);
      break;
    case "modern":
    case "classic":
    case "minimal":
    default:
      headerBg = null;
      headerText = stripHash(palette.headerText);
      headerSubText = stripHash(palette.headerSubText, palette.headerText);
      break;
  }

  return {
    font: fontSet.docx,
    headerBg,
    headerText,
    headerSubText,
    accent: stripHash(palette.accent),
    bodyText: stripHash(palette.bodyText),
    subText: stripHash(palette.subText),
    sectionBorder: stripHash(palette.sectionBorder),
  };
}

// ── PDF generation ──────────────────────────────────────────────────

export async function generatePdfBuffer(
  data: ResumeData,
  templateId: TemplateId
): Promise<Buffer> {
  const doc = createPdfDocument(data, templateId);
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}

export async function generatePdfBufferFromTheme(
  data: ResumeData,
  themeConfig: ThemeConfig
): Promise<Buffer> {
  const doc = createPdfDocumentFromTheme(data, themeConfig);
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}

// ── DOCX generation ─────────────────────────────────────────────────

export async function generateDocxBuffer(
  data: ResumeData,
  templateId: TemplateId
): Promise<Buffer> {
  const themeConfig = deriveThemeConfig(templateId);
  return generateDocxBufferFromTheme(data, themeConfig);
}

export async function generateDocxBufferFromTheme(
  data: ResumeData,
  themeConfig: ThemeConfig
): Promise<Buffer> {
  const theme = resolveDocxTheme(themeConfig);
  const sections: Paragraph[] = [];

  // Name
  const nameShading = theme.headerBg
    ? { type: ShadingType.SOLID, color: theme.headerBg, fill: theme.headerBg }
    : undefined;

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.contactInfo.fullName,
          bold: true,
          size: 28,
          font: theme.font,
          color: theme.headerText,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      shading: nameShading,
    })
  );

  // Contact info
  const contactParts: string[] = [];
  if (data.contactInfo.email) contactParts.push(data.contactInfo.email);
  if (data.contactInfo.phone) contactParts.push(data.contactInfo.phone);
  if (data.contactInfo.location) contactParts.push(data.contactInfo.location);
  if (data.contactInfo.linkedin) contactParts.push(data.contactInfo.linkedin);
  if (data.contactInfo.website) contactParts.push(data.contactInfo.website);
  if (data.contactInfo.github) contactParts.push(data.contactInfo.github);

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 18,
            font: theme.font,
            color: theme.headerSubText,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        shading: nameShading,
      })
    );
  }

  // Summary
  if (data.summary) {
    sections.push(createSectionHeader("PROFESSIONAL SUMMARY", theme));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.summary, size: 20, font: theme.font, color: theme.subText }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    sections.push(createSectionHeader("EXPERIENCE", theme));
    for (const exp of data.experience) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
              font: theme.font,
              color: theme.bodyText,
            }),
            new TextRun({
              text: `  ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`,
              size: 18,
              font: theme.font,
              color: theme.subText,
            }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` - ${exp.location}` : ""}`,
              size: 20,
              font: theme.font,
              color: theme.subText,
            }),
          ],
          spacing: { after: 60 },
        })
      );
      for (const highlight of exp.highlights) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${highlight}`, size: 20, font: theme.font, color: theme.bodyText }),
            ],
            indent: { left: 360 },
            spacing: { before: 40 },
          })
        );
      }
    }
  }

  // Education
  if (data.education.length > 0) {
    sections.push(createSectionHeader("EDUCATION", theme));
    for (const edu of data.education) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 22,
              font: theme.font,
              color: theme.bodyText,
            }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              size: 20,
              font: theme.font,
              color: theme.subText,
            }),
            ...(edu.endDate
              ? [
                  new TextRun({
                    text: ` | ${edu.endDate}`,
                    size: 18,
                    font: theme.font,
                    color: theme.subText,
                  }),
                ]
              : []),
            ...(edu.gpa
              ? [
                  new TextRun({
                    text: ` | GPA: ${edu.gpa}`,
                    size: 18,
                    font: theme.font,
                    color: theme.subText,
                  }),
                ]
              : []),
          ],
        })
      );
    }
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(createSectionHeader("SKILLS", theme));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join(", "),
            size: 20,
            font: theme.font,
            color: theme.bodyText,
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Projects
  if (data.projects.length > 0) {
    sections.push(createSectionHeader("PROJECTS", theme));
    for (const proj of data.projects) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 22,
              font: theme.font,
              color: theme.bodyText,
            }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.description,
              size: 20,
              font: theme.font,
              color: theme.subText,
            }),
          ],
        })
      );
      if (proj.technologies.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${proj.technologies.join(", ")}`,
                italics: true,
                size: 18,
                font: theme.font,
                color: theme.subText,
              }),
            ],
          })
        );
      }
    }
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push(createSectionHeader("CERTIFICATIONS", theme));
    for (const cert of data.certifications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${cert.name} - ${cert.issuer}`,
              size: 20,
              font: theme.font,
              color: theme.bodyText,
            }),
            ...(cert.date
              ? [
                  new TextRun({
                    text: ` (${cert.date})`,
                    size: 18,
                    font: theme.font,
                    color: theme.subText,
                  }),
                ]
              : []),
          ],
          spacing: { before: 60 },
        })
      );
    }
  }

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

function createSectionHeader(text: string, theme: DocxTheme): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        font: theme.font,
        color: theme.accent,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: theme.sectionBorder,
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}
