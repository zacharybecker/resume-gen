import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData, TemplateId } from "@resume-gen/shared";

// Color palette matching the frontend Tailwind theme
const colors = {
  coral: "#FF6B6B",
  dark: "#1A1A1A",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray900: "#111827",
  green400: "#4ADE80",
  green600: "#16A34A",
  white: "#FFFFFF",
};

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

const themes: Record<TemplateId, TemplateTheme> = {
  modern: {
    fontFamily: "Helvetica",
    fontFamilyBold: "Helvetica-Bold",
    headerBg: colors.white,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.coral,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  classic: {
    fontFamily: "Times-Roman",
    fontFamilyBold: "Times-Bold",
    headerBg: colors.white,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.gray700,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  minimal: {
    fontFamily: "Helvetica",
    fontFamilyBold: "Helvetica-Bold",
    headerBg: colors.white,
    headerText: colors.dark,
    headerSubText: colors.gray500,
    accent: colors.gray500,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  creative: {
    fontFamily: "Helvetica",
    fontFamilyBold: "Helvetica-Bold",
    headerBg: colors.coral,
    headerText: colors.white,
    headerSubText: "rgba(255,255,255,0.8)",
    accent: colors.coral,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  executive: {
    fontFamily: "Times-Roman",
    fontFamilyBold: "Times-Bold",
    headerBg: colors.dark,
    headerText: colors.white,
    headerSubText: "rgba(255,255,255,0.8)",
    accent: colors.dark,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
  technical: {
    fontFamily: "Courier",
    fontFamilyBold: "Courier-Bold",
    headerBg: colors.gray900,
    headerText: colors.green400,
    headerSubText: "rgba(74,222,128,0.8)",
    accent: colors.green600,
    bodyText: colors.dark,
    subText: colors.gray600,
    sectionBorder: colors.gray200,
  },
};

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
      ...(theme.headerBg === colors.white
        ? { borderBottomWidth: 1, borderBottomColor: colors.gray200 }
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
      color: colors.gray400,
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
      backgroundColor: colors.gray100,
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
      color: colors.gray500,
      fontStyle: "italic" as const,
      marginTop: 2,
    },
    certEntry: {
      fontSize: 10,
      marginBottom: 3,
    },
    certDate: {
      fontSize: 9,
      color: colors.gray400,
    },
  });
}

export function createPdfDocument(
  data: ResumeData,
  templateId: TemplateId
): React.ReactElement {
  const theme = themes[templateId] || themes.modern;
  const styles = buildStyles(theme);

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
