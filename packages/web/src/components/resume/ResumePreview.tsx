import type { ResumeData, TemplateId } from "@resume-gen/shared";

interface ResumePreviewProps {
  data: ResumeData;
  templateId: TemplateId;
}

const templateStyles: Record<TemplateId, { headerBg: string; headerText: string; accent: string; fontClass: string }> = {
  modern: { headerBg: "bg-white", headerText: "text-dark", accent: "text-coral", fontClass: "font-sans" },
  classic: { headerBg: "bg-white", headerText: "text-dark", accent: "text-gray-700", fontClass: "font-serif" },
  minimal: { headerBg: "bg-white", headerText: "text-dark", accent: "text-gray-500", fontClass: "font-sans" },
  creative: { headerBg: "bg-coral", headerText: "text-white", accent: "text-coral", fontClass: "font-sans" },
  executive: { headerBg: "bg-dark", headerText: "text-white", accent: "text-dark", fontClass: "font-serif" },
  technical: { headerBg: "bg-gray-900", headerText: "text-green-400", accent: "text-green-600", fontClass: "font-mono" },
};

export default function ResumePreview({ data, templateId }: ResumePreviewProps) {
  const style = templateStyles[templateId];

  return (
    <div className={`mx-auto max-w-[8.5in] bg-white shadow-lg ${style.fontClass}`}>
      {/* Header */}
      <div className={`${style.headerBg} px-8 py-6 ${templateId === "creative" || templateId === "executive" || templateId === "technical" ? "" : "border-b border-gray-200"}`}>
        <h1 className={`text-2xl font-bold ${style.headerText}`}>
          {data.contactInfo.fullName}
        </h1>
        <div className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm ${templateId === "creative" || templateId === "executive" ? "text-white/80" : templateId === "technical" ? "text-green-400/80" : "text-gray-500"}`}>
          {data.contactInfo.email && <span>{data.contactInfo.email}</span>}
          {data.contactInfo.phone && <span>{data.contactInfo.phone}</span>}
          {data.contactInfo.location && <span>{data.contactInfo.location}</span>}
          {data.contactInfo.linkedin && <span>{data.contactInfo.linkedin}</span>}
          {data.contactInfo.website && <span>{data.contactInfo.website}</span>}
          {data.contactInfo.github && <span>{data.contactInfo.github}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Summary */}
        {data.summary && (
          <section>
            <h2 className={`mb-2 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section>
            <h2 className={`mb-3 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-dark">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company}{exp.location ? ` - ${exp.location}` : ""}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.highlights.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="flex text-sm text-gray-700">
                          <span className="mr-2 mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section>
            <h2 className={`mb-3 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-dark">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-xs text-gray-400">GPA: {edu.gpa}</p>}
                  </div>
                  {edu.endDate && (
                    <span className="shrink-0 text-xs text-gray-400">{edu.endDate}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
            <h2 className={`mb-2 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section>
            <h2 className={`mb-3 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-dark">{proj.name}</h3>
                  <p className="text-sm text-gray-600">{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {proj.technologies.map((tech, j) => (
                        <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <section>
            <h2 className={`mb-2 text-sm font-bold uppercase tracking-wider ${style.accent}`}>
              Certifications
            </h2>
            <div className="space-y-1">
              {data.certifications.map((cert, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{cert.name} - {cert.issuer}</span>
                  {cert.date && <span className="text-xs text-gray-400">{cert.date}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
