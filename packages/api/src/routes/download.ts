import { Router, type Request, type Response } from "express";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";
import { generatePdfBuffer, generateDocxBuffer, generatePdfBufferFromTheme, generateDocxBufferFromTheme } from "../services/document.js";
import type { ResumeData, TemplateId, ThemeConfig } from "@resume-gen/shared";
import { deriveThemeConfig } from "@resume-gen/shared";

export const downloadRouter: Router = Router();

downloadRouter.use(authMiddleware);

downloadRouter.get("/:id/download/:format", async (req: Request, res: Response) => {
  const uid = getUid(req);
  const resumeId = req.params.id as string;
  const format = req.params.format as string;

  if (format !== "pdf" && format !== "docx") {
    res.status(400).json({ message: "Format must be pdf or docx" });
    return;
  }

  try {
    const resumeDoc = await adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .doc(resumeId)
      .get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    const resume = resumeDoc.data()!;
    const resumeData = resume.resumeData as ResumeData;

    if (!resumeData) {
      res.status(400).json({ message: "Resume has no data yet" });
      return;
    }

    const templateId = (resume.templateId || "modern") as TemplateId;
    const themeConfig: ThemeConfig = resume.themeConfig || deriveThemeConfig(templateId);
    const title = resume.title || "resume";
    const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");

    if (format === "pdf") {
      const buffer = await generatePdfBufferFromTheme(resumeData, themeConfig);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
      res.send(buffer);
    } else {
      const buffer = await generateDocxBufferFromTheme(resumeData, themeConfig);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}.docx"`);
      res.send(buffer);
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Failed to generate document" });
  }
});
