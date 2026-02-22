import { Router, type Request, type Response } from "express";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";
import { requireCredits, refundCredit } from "../middleware/credits.js";
import { generateResume } from "../services/ai.js";
import { FieldValue } from "firebase-admin/firestore";

export const generateRouter: Router = Router();

generateRouter.use(authMiddleware);

generateRouter.post(
  "/:id/generate",
  requireCredits,
  async (req: Request, res: Response) => {
    const uid = getUid(req);
    const resumeId = req.params.id as string;

    try {
      const resumeRef = adminDb
        .collection("users")
        .doc(uid)
        .collection("resumes")
        .doc(resumeId);

      const resumeDoc = await resumeRef.get();
      if (!resumeDoc.exists) {
        await refundCredit(uid);
        res.status(404).json({ message: "Resume not found" });
        return;
      }

      const resume = resumeDoc.data()!;

      // Update status to generating
      await resumeRef.update({
        status: "generating",
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Generate resume with AI
      const resumeData = await generateResume({
        mode: resume.mode,
        inputSources: resume.inputSources,
        templateId: resume.templateId,
        jobPosting: resume.jobPosting,
      });

      // Update resume with generated data
      await resumeRef.update({
        resumeData,
        status: "complete",
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updated = await resumeRef.get();
      res.json({ id: updated.id, ...updated.data() });
    } catch (error) {
      console.error("Generate error:", error);
      await refundCredit(uid);
      res.status(500).json({ message: "Failed to generate resume" });
    }
  }
);
