import { Router, type Request, type Response } from "express";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";
import { FieldValue } from "firebase-admin/firestore";

export const resumesRouter: Router = Router();

resumesRouter.use(authMiddleware);

// List resumes
resumesRouter.get("/", async (req: Request, res: Response) => {
  const uid = getUid(req);
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .orderBy("updatedAt", "desc")
      .get();

    const resumes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(resumes);
  } catch {
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

// Get single resume
resumesRouter.get("/:id", async (req: Request, res: Response) => {
  const uid = getUid(req);
  try {
    const doc = await adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .doc(req.params.id as string)
      .get();

    if (!doc.exists) {
      res.status(404).json({ message: "Resume not found" });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

// Create resume
resumesRouter.post("/", async (req: Request, res: Response) => {
  const uid = getUid(req);
  const { title, templateId, mode, jobPosting, inputSources } = req.body;

  try {
    const docRef = await adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .add({
        userId: uid,
        title: title || "Untitled Resume",
        templateId: templateId || "modern",
        mode: mode || "create",
        jobPosting: jobPosting || null,
        inputSources: inputSources || [],
        resumeData: null,
        resumeHtml: null,
        status: "draft",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch {
    res.status(500).json({ message: "Failed to create resume" });
  }
});

// Delete resume
resumesRouter.delete("/:id", async (req: Request, res: Response) => {
  const uid = getUid(req);
  try {
    await adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .doc(req.params.id as string)
      .delete();

    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to delete resume" });
  }
});
