export interface ContactInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights?: string[];
}

export interface ResumeData {
  contactInfo: ContactInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  projects: Project[];
}

export type ResumeMode = "create" | "tune";
export type ResumeStatus = "draft" | "generating" | "complete";
export type TemplateId = "modern" | "classic" | "minimal" | "creative" | "executive" | "technical";

export interface InputSource {
  type: "upload" | "linkedin" | "text";
  filename?: string;
  content: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  mode: ResumeMode;
  jobPosting: string | null;
  inputSources: InputSource[];
  resumeData: ResumeData | null;
  resumeHtml: string | null;
  status: ResumeStatus;
  createdAt: Date;
  updatedAt: Date;
}
