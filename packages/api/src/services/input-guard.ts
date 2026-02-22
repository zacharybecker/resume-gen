/**
 * Input guard — sanitization, validation, and relevance checking
 * for user-provided text before it reaches the AI.
 */

// ── Length limits ──────────────────────────────────────────────

const MAX_CHAT_MESSAGE_LENGTH = 5_000;
const MAX_JOB_POSTING_LENGTH = 15_000;
const MAX_INPUT_SOURCE_LENGTH = 30_000;
const MAX_RESUME_TITLE_LENGTH = 200;

// ── Sanitization ───────────────────────────────────────────────

/**
 * Escape XML-style tags that could break our prompt delimiters.
 * We use <user_input>, <existing_resume>, <job_posting>, and
 * <resume_update> as structural markers — user content must not
 * contain these (or close-tags that could prematurely end a block).
 */
const RESERVED_TAGS = [
  "user_input",
  "existing_resume",
  "job_posting",
  "resume_update",
  "system",
  "prompt",
  "instructions",
  "assistant",
];

const RESERVED_TAG_PATTERN = new RegExp(
  `<\\/?(${RESERVED_TAGS.join("|")})\\s*/?>`,
  "gi"
);

export function sanitizeForPrompt(text: string): string {
  // Replace reserved XML-like tags with escaped versions
  return text.replace(RESERVED_TAG_PATTERN, (match) => {
    return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  });
}

// ── Validation ─────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateChatMessage(message: string): ValidationResult {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message is required" };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${MAX_CHAT_MESSAGE_LENGTH} characters`,
    };
  }

  return { valid: true };
}

export function validateJobPosting(jobPosting: string): ValidationResult {
  if (typeof jobPosting !== "string") {
    return { valid: false, error: "Job posting must be a string" };
  }

  if (jobPosting.length > MAX_JOB_POSTING_LENGTH) {
    return {
      valid: false,
      error: `Job posting exceeds maximum length of ${MAX_JOB_POSTING_LENGTH} characters`,
    };
  }

  return { valid: true };
}

export function validateInputSources(
  inputSources: Array<{ type: string; content: string }>
): ValidationResult {
  if (!Array.isArray(inputSources)) {
    return { valid: false, error: "Input sources must be an array" };
  }

  if (inputSources.length > 5) {
    return { valid: false, error: "Maximum of 5 input sources allowed" };
  }

  for (let i = 0; i < inputSources.length; i++) {
    const source = inputSources[i];
    if (!source.content || typeof source.content !== "string") {
      return { valid: false, error: `Input source ${i + 1} has no content` };
    }
    if (source.content.length > MAX_INPUT_SOURCE_LENGTH) {
      return {
        valid: false,
        error: `Input source ${i + 1} exceeds maximum length of ${MAX_INPUT_SOURCE_LENGTH} characters`,
      };
    }
  }

  return { valid: true };
}

export function validateResumeTitle(title: string): ValidationResult {
  if (typeof title !== "string") {
    return { valid: false, error: "Title must be a string" };
  }

  if (title.length > MAX_RESUME_TITLE_LENGTH) {
    return {
      valid: false,
      error: `Title exceeds maximum length of ${MAX_RESUME_TITLE_LENGTH} characters`,
    };
  }

  return { valid: true };
}

// ── Off-topic detection ────────────────────────────────────────

/**
 * Lightweight pattern-based check for obviously off-topic content.
 * This catches the most blatant misuse. The system prompt handles
 * subtler cases by instructing Claude to refuse non-resume requests.
 */
const OFF_TOPIC_PATTERNS = [
  // Prompt injection attempts
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /you\s+are\s+now\s+(?:a|an)\s+(?!resume|career|professional)/i,
  /new\s+system\s+prompt/i,
  /override\s+(system|instructions|prompt)/i,
  /jailbreak/i,
  /\bDAN\b.*\bmode\b/i,

  // Clearly unrelated requests
  /write\s+(?:me\s+)?(?:a\s+)?(?:poem|story|song|essay|code|script|malware|exploit)/i,
  /(?:how|help)\s+(?:to|me)\s+(?:hack|exploit|attack|steal|scam|phish)/i,
  /generate\s+(?:a\s+)?(?:fake|forged|fraudulent)\s+(?:id|passport|document|certificate)/i,
];

export function checkContentRelevance(text: string): ValidationResult {
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(text)) {
      return {
        valid: false,
        error:
          "Your message appears to be unrelated to resume creation. Please keep your requests focused on your resume.",
      };
    }
  }

  return { valid: true };
}

// ── Combined pipeline ──────────────────────────────────────────

export function sanitizeAndValidateChatMessage(message: string): {
  sanitized: string;
  validation: ValidationResult;
} {
  const validation = validateChatMessage(message);
  if (!validation.valid) return { sanitized: message, validation };

  const relevance = checkContentRelevance(message);
  if (!relevance.valid) return { sanitized: message, validation: relevance };

  return { sanitized: sanitizeForPrompt(message.trim()), validation: { valid: true } };
}

export function sanitizeAndValidateInputSources(
  inputSources: Array<{ type: string; content: string }>
): {
  sanitized: Array<{ type: string; content: string }>;
  validation: ValidationResult;
} {
  const validation = validateInputSources(inputSources);
  if (!validation.valid) return { sanitized: inputSources, validation };

  for (const source of inputSources) {
    const relevance = checkContentRelevance(source.content);
    if (!relevance.valid) return { sanitized: inputSources, validation: relevance };
  }

  const sanitized = inputSources.map((s) => ({
    ...s,
    content: sanitizeForPrompt(s.content),
  }));

  return { sanitized, validation: { valid: true } };
}

export function sanitizeAndValidateJobPosting(jobPosting: string): {
  sanitized: string;
  validation: ValidationResult;
} {
  const validation = validateJobPosting(jobPosting);
  if (!validation.valid) return { sanitized: jobPosting, validation };

  const relevance = checkContentRelevance(jobPosting);
  if (!relevance.valid) return { sanitized: jobPosting, validation: relevance };

  return { sanitized: sanitizeForPrompt(jobPosting.trim()), validation: { valid: true } };
}
