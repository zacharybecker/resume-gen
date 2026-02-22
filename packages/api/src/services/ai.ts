import Anthropic from "@anthropic-ai/sdk";
import { BASE_SYSTEM_PROMPT } from "../prompts/base.js";
import { getTemplatePrompt } from "../prompts/templates.js";
import { getCreatePrompt } from "../prompts/create.js";
import { getTunePrompt } from "../prompts/tune.js";
import type { ChatStreamEvent } from "@resume-gen/shared";

const anthropic = new Anthropic();

interface GenerateInput {
  mode: string;
  inputSources: Array<{ type: string; content: string }>;
  templateId: string;
  jobPosting: string | null;
}

interface ChatInput {
  resume: Record<string, unknown>;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
}

export async function generateResume(
  input: GenerateInput
): Promise<Record<string, unknown>> {
  const inputText = input.inputSources
    .map((s) => s.content)
    .join("\n\n---\n\n");

  const modePrompt =
    input.mode === "tune"
      ? getTunePrompt(inputText, input.jobPosting || "")
      : getCreatePrompt(inputText);

  const systemPrompt = [
    BASE_SYSTEM_PROMPT,
    getTemplatePrompt(input.templateId),
    modePrompt,
  ].join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Generate a professional resume from the following information. Return ONLY valid JSON matching the ResumeData schema.\n\n${inputText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse resume data from AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function streamChatResponse(
  input: ChatInput,
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  const systemPrompt = [
    BASE_SYSTEM_PROMPT,
    getTemplatePrompt((input.resume.templateId as string) || "modern"),
    `Current resume data:\n${JSON.stringify(input.resume.resumeData, null, 2)}`,
    `If you need to update the resume, include a JSON block wrapped in <resume_update>...</resume_update> tags in your response.`,
  ].join("\n\n");

  const messages = [
    ...input.history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: input.userMessage },
  ];

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  let fullText = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      onEvent({ type: "text", content: event.delta.text });
    }
  }

  // Check for resume updates in the response
  const updateMatch = fullText.match(
    /<resume_update>([\s\S]*?)<\/resume_update>/
  );
  if (updateMatch) {
    try {
      const resumeData = JSON.parse(updateMatch[1]);
      onEvent({ type: "resume_update", resumeData });
    } catch {
      // Not valid JSON, skip update
    }
  }
}
