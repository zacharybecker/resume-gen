import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { apiStream } from "../../lib/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import type { ChatStreamEvent } from "@resume-gen/shared";

interface ChatPanelProps {
  resumeId: string;
  onResumeUpdate: (data: Record<string, unknown>) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({ resumeId, onResumeUpdate }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "resumes", resumeId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        role: doc.data().role as "user" | "assistant",
        content: doc.data().content as string,
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [user, resumeId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const handleSend = async (message: string) => {
    // Optimistic UI: add user message immediately
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: message },
    ]);
    setStreaming(true);
    setStreamingText("");

    try {
      const { response } = apiStream(`/resumes/${resumeId}/chat`, {
        message,
      });

      const res = await response;
      if (!res.ok) throw new Error("Stream failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          try {
            const event: ChatStreamEvent = JSON.parse(data);

            if (event.type === "text") {
              setStreamingText((prev) => prev + (event.content || ""));
            }
            if (event.type === "resume_update" && event.resumeData) {
              onResumeUpdate(event.resumeData);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !streaming && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">
              Ask me to modify your resume...
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {streaming && streamingText && (
          <ChatMessage role="assistant" content={streamingText} />
        )}
        {streaming && !streamingText && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  );
}
