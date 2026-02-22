export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  resumeId: string;
  role: MessageRole;
  content: string;
  resumeSnapshot: Record<string, unknown> | null;
  creditCharged: boolean;
  createdAt: Date;
}

export interface ChatStreamEvent {
  type: "text" | "resume_update" | "done" | "error";
  content?: string;
  resumeData?: Record<string, unknown>;
  error?: string;
}
