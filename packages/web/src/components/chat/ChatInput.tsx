import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask to modify your resume..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-dark placeholder-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="shrink-0 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
        >
          Send
        </button>
      </div>
      <p className="mt-1.5 text-xs text-gray-400">
        Messages that change your resume cost 1 credit. Questions are free.
      </p>
    </div>
  );
}
