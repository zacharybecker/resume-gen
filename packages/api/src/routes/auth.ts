import { Router, type Request, type Response } from "express";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";

export const authRouter: Router = Router();

authRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const uid = getUid(req);
  try {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ uid, ...userDoc.data() });
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
