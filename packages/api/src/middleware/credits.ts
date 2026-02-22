import type { Request, Response, NextFunction } from "express";
import { adminDb } from "../config/firebase.js";
import { getUid } from "./auth.js";
import { FieldValue } from "firebase-admin/firestore";

export async function requireCredits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userRef = adminDb.collection("users").doc(getUid(req));

  try {
    const success = await adminDb.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      const credits = userDoc.data()?.credits ?? 0;
      if (credits < 1) return false;
      tx.update(userRef, {
        credits: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });

    if (!success) {
      res.status(402).json({ message: "Insufficient credits" });
      return;
    }

    next();
  } catch {
    res.status(500).json({ message: "Failed to check credits" });
  }
}

export async function refundCredit(uid: string): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);
  await userRef.update({
    credits: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
