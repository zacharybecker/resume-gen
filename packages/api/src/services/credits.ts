import { adminDb } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export async function addCredits(
  uid: string,
  amount: number
): Promise<number> {
  const userRef = adminDb.collection("users").doc(uid);

  return adminDb.runTransaction(async (tx) => {
    const userDoc = await tx.get(userRef);
    const currentCredits = userDoc.data()?.credits ?? 0;
    const newCredits = currentCredits + amount;

    tx.update(userRef, {
      credits: newCredits,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return newCredits;
  });
}

export async function getCredits(uid: string): Promise<number> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  return userDoc.data()?.credits ?? 0;
}
