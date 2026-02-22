import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";
import type { Resume } from "@resume-gen/shared";

export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "resumes"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Resume[];
      setResumes(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { resumes, loading };
}
