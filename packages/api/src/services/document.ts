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
import { createPdfDocument } from "./pdf-templates.js";

export async function generatePdfBuffer(
  data: ResumeData,
  templateId: TemplateId
): Promise<Buffer> {
  const doc = createPdfDocument(data, templateId);
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}

// Color palette matching the frontend Tailwind theme
const colors = {
  coral: "FF6B6B",
  dark: "1A1A1A",
  gray100: "F3F4F6",
  gray200: "E5E7EB",
  gray400: "9CA3AF",
  gray500: "6B7280",
  gray600: "4B5563",
  gray700: "374151",
  gray900: "111827",
  green400: "4ADE80",
  green600: "16A34A",
  white: "FFFFFF",
};

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

const docxThemes: Record<TemplateId, DocxTheme> = {
  modern: {
    font: "Calibri",
    headerBg: null,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.coral,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  classic: {
    font: "Times New Roman",
    headerBg: null,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.gray700,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  minimal: {
    font: "Calibri",
    headerBg: null,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.gray500,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  creative: {
    font: "Calibri",
    headerBg: colors.coral,
    headerText: colors.white,
    headerSubText: colors.white,
    accent: colors.coral,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  executive: {
    font: "Times New Roman",
    headerBg: colors.dark,
    headerText: colors.white,
    headerSubText: colors.white,
    accent: colors.dark,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  technical: {
    font: "Courier New",
    headerBg: colors.gray900,
    headerText: colors.green400,
    headerSubText: colors.green400,
    accent: colors.green600,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
};

export async function generateDocxBuffer(
  data: ResumeData,
  templateId: TemplateId
): Promise<Buffer> {
  const theme = docxThemes[templateId] || docxThemes.modern;
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
              color: colors.gray400,
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
                    color: colors.gray400,
                  }),
                ]
              : []),
            ...(edu.gpa
              ? [
                  new TextRun({
                    text: ` | GPA: ${edu.gpa}`,
                    size: 18,
                    font: theme.font,
                    color: colors.gray400,
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
                color: colors.gray500,
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
                    color: colors.gray400,
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
