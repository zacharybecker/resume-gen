import type { Request, Response, NextFunction } from "express";
import { adminAuth, adminDb } from "../config/firebase.js";
import { FREE_CREDITS } from "@resume-gen/shared";
import { FieldValue } from "firebase-admin/firestore";

export interface AuthRequest extends Request {
  uid: string;
}

export function getUid(req: Request): string {
  return (req as unknown as AuthRequest).uid;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing authorization header" });
    return;
  }

  try {
    const token = header.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    (req as AuthRequest).uid = decoded.uid;

    // Ensure user document exists (first login)
    const userRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({
        email: decoded.email || "",
        displayName: decoded.name || "",
        photoURL: decoded.picture || "",
        credits: Number(process.env.FREE_CREDITS) || FREE_CREDITS,
        stripeCustomerId: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
