import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData, ThemeConfig } from "@resume-gen/shared";
import { getColorPalette, getFontSet } from "@resume-gen/shared";

interface TemplateTheme {
  fontFamily: string;
  fontFamilyBold: string;
  headerBg: string;
  headerText: string;
  headerSubText: string;
  accent: string;
  bodyText: string;
  subText: string;
  sectionBorder: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function resolveTheme(themeConfig: ThemeConfig): TemplateTheme {
  const palette = getColorPalette(themeConfig.colorScheme);
  const fontSet = getFontSet(themeConfig.fontFamily);

  let headerBg: string;
  let headerText: string;
  let headerSubText: string;

  switch (themeConfig.layout) {
    case "creative":
      headerBg = palette.accent;
      headerText = "#FFFFFF";
      headerSubText = "rgba(255,255,255,0.8)";
      break;
    case "executive":
      headerBg = palette.primary;
      headerText = "#FFFFFF";
      headerSubText = "rgba(255,255,255,0.8)";
      break;
    case "technical":
      headerBg = "#111827";
      headerText = palette.accent;
      headerSubText = hexToRgba(palette.accent, 0.8);
      break;
    case "modern":
    case "classic":
    case "minimal":
    default:
      headerBg = palette.headerBg;
      headerText = palette.headerText;
      headerSubText = palette.headerSubText;
      break;
  }

  return {
    headerBg,
    headerText,
    headerSubText,
    accent: palette.accent,
    bodyText: palette.bodyText,
    subText: palette.subText,
    sectionBorder: palette.sectionBorder,
    fontFamily: fontSet.pdf,
    fontFamilyBold: fontSet.pdfBold,
  };
}

function buildStyles(theme: TemplateTheme) {
  return StyleSheet.create({
    page: {
      paddingTop: 0,
      paddingBottom: 40,
      paddingHorizontal: 0,
      fontSize: 10,
      fontFamily: theme.fontFamily,
      color: theme.bodyText,
    },
    header: {
      backgroundColor: theme.headerBg,
      paddingHorizontal: 40,
      paddingVertical: 24,
      marginBottom: 0,
      ...(theme.headerBg === "#FFFFFF"
        ? { borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }
        : {}),
    },
    name: {
      fontSize: 22,
      fontFamily: theme.fontFamilyBold,
      color: theme.headerText,
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 8,
      fontSize: 9,
      color: theme.headerSubText,
    },
    body: {
      paddingHorizontal: 40,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: theme.fontFamilyBold,
      textTransform: "uppercase" as const,
      letterSpacing: 1,
      marginTop: 14,
      marginBottom: 6,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: theme.sectionBorder,
      color: theme.accent,
    },
    summary: {
      fontSize: 10,
      lineHeight: 1.5,
      color: theme.subText,
      marginBottom: 4,
    },
    expEntry: {
      marginBottom: 8,
    },
    expHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginBottom: 2,
    },
    expTitle: {
      fontFamily: theme.fontFamilyBold,
      fontSize: 11,
      color: theme.bodyText,
    },
    expDate: {
      fontSize: 9,
      color: theme.subText,
    },
    expCompany: {
      fontSize: 10,
      color: theme.subText,
      marginBottom: 3,
    },
    bullet: {
      flexDirection: "row" as const,
      marginBottom: 2,
      paddingLeft: 8,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.4,
    },
    eduEntry: {
      marginBottom: 6,
    },
    skillsRow: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: 4,
    },
    skillTag: {
      backgroundColor: "#F3F4F6",
      padding: "2 6",
      borderRadius: 3,
      fontSize: 9,
    },
    projEntry: {
      marginBottom: 6,
    },
    projName: {
      fontFamily: theme.fontFamilyBold,
      fontSize: 10,
      color: theme.bodyText,
    },
    projDesc: {
      fontSize: 9,
      color: theme.subText,
      marginTop: 1,
    },
    techRow: {
      fontSize: 8,
      color: theme.subText,
      fontStyle: "italic" as const,
      marginTop: 2,
    },
    certEntry: {
      fontSize: 10,
      marginBottom: 3,
    },
    certDate: {
      fontSize: 9,
      color: theme.subText,
    },
  });
}

function renderDocument(
  data: ResumeData,
  styles: ReturnType<typeof buildStyles>
): React.ReactElement {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.contactInfo.fullName}</Text>
          <View style={styles.contactRow}>
            {data.contactInfo.email && <Text>{data.contactInfo.email}</Text>}
            {data.contactInfo.phone && <Text>{data.contactInfo.phone}</Text>}
            {data.contactInfo.location && (
              <Text>{data.contactInfo.location}</Text>
            )}
            {data.contactInfo.linkedin && (
              <Text>{data.contactInfo.linkedin}</Text>
            )}
            {data.contactInfo.website && (
              <Text>{data.contactInfo.website}</Text>
            )}
            {data.contactInfo.github && <Text>{data.contactInfo.github}</Text>}
          </View>
        </View>

        <View style={styles.body}>
          {/* Summary */}
          {data.summary && (
            <View>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={styles.summary}>{data.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, i) => (
                <View key={i} style={styles.expEntry}>
                  <View style={styles.expHeader}>
                    <Text style={styles.expTitle}>{exp.title}</Text>
                    <Text style={styles.expDate}>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.expCompany}>
                    {exp.company}
                    {exp.location ? ` - ${exp.location}` : ""}
                  </Text>
                  {exp.highlights.map((h, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{h}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={styles.eduEntry}>
                  <Text style={styles.expTitle}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={styles.expCompany}>
                    {edu.institution}
                    {edu.endDate ? ` | ${edu.endDate}` : ""}
                    {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsRow}>
                {data.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillTag}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Projects</Text>
              {data.projects.map((proj, i) => (
                <View key={i} style={styles.projEntry}>
                  <Text style={styles.projName}>{proj.name}</Text>
                  <Text style={styles.projDesc}>{proj.description}</Text>
                  {proj.technologies.length > 0 && (
                    <Text style={styles.techRow}>
                      {proj.technologies.join(", ")}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {data.certifications.map((cert, i) => (
                <View key={i} style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 3 }}>
                  <Text style={styles.certEntry}>
                    {cert.name} - {cert.issuer}
                  </Text>
                  {cert.date && <Text style={styles.certDate}>{cert.date}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export function createPdfDocumentFromTheme(
  data: ResumeData,
  themeConfig: ThemeConfig
): React.ReactElement {
  const theme = resolveTheme(themeConfig);
  const styles = buildStyles(theme);
  return renderDocument(data, styles);
}

