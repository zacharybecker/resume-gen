import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ResumeData, TemplateId } from "@resume-gen/shared";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1A1A1A",
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 9,
    color: "#666666",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#DDDDDD",
    color: "#FF6B6B",
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#444444",
    marginBottom: 4,
  },
  expEntry: {
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  expDate: {
    fontSize: 9,
    color: "#999999",
  },
  expCompany: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 3,
  },
  bullet: {
    flexDirection: "row",
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
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  projDesc: {
    fontSize: 9,
    color: "#666666",
    marginTop: 1,
  },
  techRow: {
    fontSize: 8,
    color: "#888888",
    fontStyle: "italic",
    marginTop: 2,
  },
  certEntry: {
    fontSize: 10,
    marginBottom: 3,
  },
});

export function createPdfDocument(
  data: ResumeData,
  _templateId: TemplateId
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
              <Text key={i} style={styles.certEntry}>
                {cert.name} - {cert.issuer}
                {cert.date ? ` (${cert.date})` : ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
