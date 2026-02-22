import { Router, type Request, type Response } from "express";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";
import { streamChatResponse } from "../services/ai.js";
import { sanitizeAndValidateChatMessage } from "../services/input-guard.js";
import { FieldValue } from "firebase-admin/firestore";

export const chatRouter: Router = Router();

chatRouter.use(authMiddleware);

chatRouter.post("/:id/chat", async (req: Request, res: Response) => {
  const uid = getUid(req);
  const resumeId = req.params.id as string;
  const { message } = req.body;

  const { sanitized: sanitizedMessage, validation } =
    sanitizeAndValidateChatMessage(message ?? "");
  if (!validation.valid) {
    res.status(400).json({ message: validation.error });
    return;
  }

  try {
    // Get resume
    const resumeRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("resumes")
      .doc(resumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    const resume = resumeDoc.data()!;

    // Get chat history
    const messagesSnapshot = await resumeRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const history = messagesSnapshot.docs.map((doc) => ({
      role: doc.data().role as "user" | "assistant",
      content: doc.data().content as string,
    }));

    // Save user message
    await resumeRef.collection("messages").add({
      role: "user",
      content: sanitizedMessage,
      resumeSnapshot: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Set up SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let fullResponse = "";
    let resumeUpdate: Record<string, unknown> | null = null;

    await streamChatResponse(
      {
        resume,
        history,
        userMessage: sanitizedMessage,
      },
      (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);

        if (event.type === "text") {
          fullResponse += event.content || "";
        }
        if (event.type === "resume_update" && event.resumeData) {
          resumeUpdate = event.resumeData;
        }
      }
    );

    // Save assistant message
    await resumeRef.collection("messages").add({
      role: "assistant",
      content: fullResponse,
      resumeSnapshot: resumeUpdate,
      createdAt: FieldValue.serverTimestamp(),
    });

    // If resume was updated, save changes
    if (resumeUpdate) {
      await resumeRef.update({
        resumeData: resumeUpdate,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Chat error:", error);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: "Failed to process message" })}\n\n`
    );
    res.end();
  }
});
