# UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve credit pricing, fix bugs, and polish UI across the resume generator app.

**Architecture:** Five independent changes touching API routes, shared constants, and frontend components. No new dependencies needed. No test framework exists in this project.

**Tech Stack:** React 19, Express.js, Firebase Firestore, Tailwind CSS v4, TypeScript

---

### Task 1: Make chat edits free (remove credit deduction from chat)

**Files:**
- Modify: `packages/api/src/routes/chat.ts`

**Step 1: Remove credit deduction from chat route**

In `packages/api/src/routes/chat.ts`, remove the credit-related logic. Specifically:

1. Remove `creditCharged` from the user message save (line 53) - set it to `false` always or remove the field
2. Remove `const creditCharged = resumeUpdate !== null;` (line 86) and the `creditCharged` field from assistant message save
3. Remove the entire credit deduction block (lines 96-113):
```typescript
// DELETE THIS BLOCK:
      // Deduct credit for resume-modifying messages
      const userRef = adminDb.collection("users").doc(uid);
      await adminDb.runTransaction(async (tx) => {
        const userDoc = await tx.get(userRef);
        const credits = userDoc.data()?.credits ?? 0;
        if (credits >= 1) {
          tx.update(userRef, {
            credits: FieldValue.increment(-1),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
```
4. Remove the `FieldValue` import if no longer needed (check: it's still used for `serverTimestamp` in message saves, so keep it)

**Step 2: Verify the change builds**

Run: `cd packages/api && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/api/src/routes/chat.ts
git commit -m "feat: make chat edits free, only charge for initial generation"
```

---

### Task 2: Make starting credits env-configurable (default 2)

**Files:**
- Modify: `packages/shared/src/constants/credits.ts`
- Modify: `packages/api/src/middleware/auth.ts`
- Modify: `packages/api/.env.example`

**Step 1: Change default FREE_CREDITS to 2**

In `packages/shared/src/constants/credits.ts`, change line 28:
```typescript
// FROM:
export const FREE_CREDITS = 3;
// TO:
export const FREE_CREDITS = 2;
```

**Step 2: Read from env in auth middleware**

In `packages/api/src/middleware/auth.ts`, change line 38 where credits are initialized:
```typescript
// FROM:
credits: FREE_CREDITS,
// TO:
credits: Number(process.env.FREE_CREDITS) || FREE_CREDITS,
```

This reads `FREE_CREDITS` from the environment, falling back to the shared constant (2) if not set or invalid.

**Step 3: Add to .env.example**

In `packages/api/.env.example`, add:
```
FREE_CREDITS=2
```

**Step 4: Verify build**

Run: `cd packages/api && pnpm tsc --noEmit`
Expected: No type errors

**Step 5: Commit**

```bash
git add packages/shared/src/constants/credits.ts packages/api/src/middleware/auth.ts packages/api/.env.example
git commit -m "feat: make starting credits env-configurable, default to 2"
```

---

### Task 3: Make download buttons prominent with coral color

**Files:**
- Modify: `packages/web/src/pages/Editor.tsx`

**Step 1: Update download button styling**

In `packages/web/src/pages/Editor.tsx`, replace the download buttons (lines 62-73) with coral-filled buttons that include a download icon:

```tsx
<a
  href={`/api/resumes/${id}/download/pdf`}
  className="flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
>
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
  PDF
</a>
<a
  href={`/api/resumes/${id}/download/docx`}
  className="flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-dark"
>
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
  DOCX
</a>
```

**Step 2: Verify build**

Run: `cd packages/web && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/web/src/pages/Editor.tsx
git commit -m "feat: make download buttons coral and more prominent with icons"
```

---

### Task 4: Fix duplicate history entries (double-click protection)

**Files:**
- Modify: `packages/web/src/pages/CreateResume.tsx`
- Modify: `packages/web/src/pages/TuneResume.tsx`

**Step 1: Add guard to CreateResume**

In `packages/web/src/pages/CreateResume.tsx`:

1. Add early return guard at top of `handleGenerate` (after line 18):
```typescript
const handleGenerate = async () => {
  if (generating) return; // <-- ADD THIS
```

2. Add `disabled` prop to the Generate button (line 113-118):
```tsx
<button
  onClick={handleGenerate}
  disabled={generating}
  className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
>
  Generate Resume (1 credit)
</button>
```

**Step 2: Add guard to TuneResume**

In `packages/web/src/pages/TuneResume.tsx`:

1. Add early return guard at top of `handleTune` (after line 17):
```typescript
const handleTune = async () => {
  if (generating) return; // <-- ADD THIS
```

(The Tune button already has `disabled` styling but doesn't check `generating`. Add it:)

2. Update button disabled condition (line 128-131):
```tsx
<button
  onClick={handleTune}
  disabled={generating || !selectedResume || !jobPosting.trim()}
  className="rounded-lg bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
>
  Tune Resume (1 credit)
</button>
```

**Step 3: Verify build**

Run: `cd packages/web && pnpm tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add packages/web/src/pages/CreateResume.tsx packages/web/src/pages/TuneResume.tsx
git commit -m "fix: prevent duplicate resume creation from double-clicks"
```

---

### Task 5: Support multiple file uploads

**Files:**
- Modify: `packages/web/src/components/input/FileUpload.tsx`

**Step 1: Update FileUpload to handle multiple files**

Replace the entire `FileUpload.tsx` with:

```tsx
import { useState, useRef } from "react";
import { apiUpload } from "../../lib/api";

interface FileUploadProps {
  onFileProcessed: (result: { filename: string; content: string }) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      setError("Only PDF files are supported");
      return;
    }

    if (pdfFiles.length < files.length) {
      setError("Some non-PDF files were skipped");
    } else {
      setError(null);
    }

    setUploading(true);

    for (const file of pdfFiles) {
      try {
        const result = await apiUpload<{ filename: string; content: string }>(
          "/upload",
          file
        );
        onFileProcessed(result);
      } catch (err) {
        setError(
          `Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Upload failed"}`
        );
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="relative rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-coral"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0)
            handleFiles(e.target.files);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
          <p className="text-sm text-gray-500">Processing files...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600">
            Drag and drop PDFs, or{" "}
            <button
              onClick={() => inputRef.current?.click()}
              className="font-medium text-coral hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">
            Resume or LinkedIn PDF export (multiple files supported)
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

Key changes:
- Added `multiple` attribute to file input
- `handleFile` renamed to `handleFiles`, accepts `FileList`
- Filters for PDFs, processes each sequentially via existing `apiUpload`
- Drop handler processes all dropped files
- Removed single-file state (`fileName`) since `InputSourceSelector` already tracks uploaded sources
- Updated help text to say "multiple files supported"

**Step 2: Verify build**

Run: `cd packages/web && pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/web/src/components/input/FileUpload.tsx
git commit -m "feat: support multiple file uploads in resume creation"
```
