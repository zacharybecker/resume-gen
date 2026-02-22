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

export async function generateDocxBuffer(
  data: ResumeData,
  _templateId: TemplateId
): Promise<Buffer> {
  const sections: Paragraph[] = [];

  // Name
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.contactInfo.fullName,
          bold: true,
          size: 28,
          font: "Calibri",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contact info
  const contactParts: string[] = [];
  if (data.contactInfo.email) contactParts.push(data.contactInfo.email);
  if (data.contactInfo.phone) contactParts.push(data.contactInfo.phone);
  if (data.contactInfo.location) contactParts.push(data.contactInfo.location);
  if (data.contactInfo.linkedin) contactParts.push(data.contactInfo.linkedin);

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 18,
            font: "Calibri",
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Summary
  if (data.summary) {
    sections.push(createSectionHeader("PROFESSIONAL SUMMARY"));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.summary, size: 20, font: "Calibri" }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    sections.push(createSectionHeader("EXPERIENCE"));
    for (const exp of data.experience) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.title} at ${exp.company}`,
              bold: true,
              size: 22,
              font: "Calibri",
            }),
            new TextRun({
              text: `  ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`,
              size: 18,
              font: "Calibri",
              color: "999999",
            }),
          ],
          spacing: { before: 100 },
        })
      );
      if (exp.location) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.location,
                italics: true,
                size: 18,
                font: "Calibri",
                color: "666666",
              }),
            ],
          })
        );
      }
      for (const highlight of exp.highlights) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${highlight}`, size: 20, font: "Calibri" }),
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
    sections.push(createSectionHeader("EDUCATION"));
    for (const edu of data.education) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 22,
              font: "Calibri",
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
              font: "Calibri",
            }),
            ...(edu.endDate
              ? [
                  new TextRun({
                    text: ` | ${edu.endDate}`,
                    size: 18,
                    font: "Calibri",
                    color: "999999",
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
    sections.push(createSectionHeader("SKILLS"));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join(", "),
            size: 20,
            font: "Calibri",
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Projects
  if (data.projects.length > 0) {
    sections.push(createSectionHeader("PROJECTS"));
    for (const proj of data.projects) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 22,
              font: "Calibri",
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
              font: "Calibri",
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
                font: "Calibri",
                color: "666666",
              }),
            ],
          })
        );
      }
    }
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push(createSectionHeader("CERTIFICATIONS"));
    for (const cert of data.certifications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${cert.name} - ${cert.issuer}`,
              size: 20,
              font: "Calibri",
            }),
            ...(cert.date
              ? [
                  new TextRun({
                    text: ` (${cert.date})`,
                    size: 18,
                    font: "Calibri",
                    color: "999999",
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

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        font: "Calibri",
        color: "333333",
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: "CCCCCC",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}
