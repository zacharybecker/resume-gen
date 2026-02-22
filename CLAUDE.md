# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered resume generator — users upload resumes (PDF/DOCX/text), optionally provide a job posting, and Claude AI generates or tunes tailored resumes. Includes a chat interface for iterative refinement, credit-based billing via Stripe, and multi-format download (PDF/DOCX).

## Monorepo Structure

pnpm workspaces + Turborepo with three packages:

- **@resume-gen/api** (`packages/api`) — Express backend (port 3001): auth, AI generation, file parsing, document export, Stripe billing
- **@resume-gen/web** (`packages/web`) — React 19 + Vite frontend (port 5173): SPA with proxy to API at `/api/*`
- **@resume-gen/shared** (`packages/shared`) — Shared TypeScript types (`User`, `Resume`, `ResumeData`, `ChatMessage`) and constants (`TEMPLATES`, `CREDIT_PACKS`)

## Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Run API + Web concurrently (API:3001, Web:5173)
pnpm build            # Build all packages via Turbo
pnpm clean            # Remove dist directories

# Per-package (from package directory)
pnpm --filter @resume-gen/api dev     # API only with tsx watch
pnpm --filter @resume-gen/web dev     # Web only with Vite
pnpm --filter @resume-gen/shared dev  # Shared types in watch mode
```

No test framework is configured. No linter/formatter config exists — TypeScript compiler (`tsc`) is the only static check.

## Tech Stack

- **Frontend:** React 19, Vite 6, React Router 7, Tailwind CSS 4, Firebase Auth (client SDK)
- **Backend:** Express, tsx (runtime), Anthropic Claude SDK (`claude-sonnet-4-20250514`), Firebase Admin, Stripe, pdf-parse, docx
- **Database:** Firestore
- **Document Gen:** @react-pdf/renderer (PDF templates as React components), docx library (Word)
- **Build:** pnpm 10, Turborepo, TypeScript 5.7 (strict, ES2022)

## Architecture

### API Layer (`packages/api/src`)

- **Routes:** `routes/auth.ts`, `routes/resumes.ts`, `routes/upload.ts`, `routes/download.ts`, `routes/checkout.ts`, `routes/webhooks.ts`
- **Middleware:** `authMiddleware` validates Firebase JWTs and auto-creates user docs; `requireCredits` uses Firestore transactions for atomic credit deduction
- **Services:** `ai.ts` (Claude streaming), `document.ts` (PDF/DOCX generation), `parser.ts` (file parsing), `credits.ts` (credit management)
- **Prompts:** `prompts/base.ts` (system prompt), `prompts/create.ts`, `prompts/tune.ts`, `prompts/templates.ts` — composed per request
- **PDF Templates:** `pdf-templates.tsx` — 6 React PDF components (modern, classic, minimal, creative, executive, technical)

### Web Layer (`packages/web/src`)

- **Pages:** Landing, Login, Dashboard, Create, Tune, Editor (with chat), Pricing
- **Key components:** `chat/` (ChatPanel, ChatInput, ChatMessage), `resume/` (ResumePreview, TemplateCard), `input/` (FileUpload, TextInput)
- **Hooks:** `useAuth` (Firebase context), `useCredits`, `useResumes`
- **Auth:** `AuthGuard` wrapper component for protected routes
- **Vite proxy:** `/api/*` → `http://localhost:3001` in dev

### Firestore Schema

```
users/{uid}                          — email, credits, stripeCustomerId
users/{uid}/resumes/{resumeId}       — title, templateId, mode, resumeData, resumeHtml, status
users/{uid}/resumes/{id}/messages/{msgId} — role, content, resumeSnapshot, creditCharged
purchases/{purchaseId}               — userId, packId, credits, amount, status
```

### Key Flows

**AI Generation:** Upload → create resume doc → POST `/api/resumes/:id/generate` (credits checked) → Claude API with composed prompts → parsed JSON `ResumeData` → stored in Firestore

**Chat Refinement:** User message → POST `/api/resumes/:id/chat` → Claude streaming response with resume snapshot updates → real-time UI update

**Payments:** Select credit pack → Stripe checkout session → webhook confirms → credits added to user

## Environment Variables

Three `.env.example` files (root, `packages/api`, `packages/web`). Required keys:
- Firebase config (both client `VITE_FIREBASE_*` and server `FIREBASE_SERVICE_ACCOUNT_KEY` as JSON string)
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`, `CORS_ORIGIN`, `PORT`

## Conventions

- **Files:** kebab-case (`auth-middleware.ts`, `pdf-templates.tsx`)
- **Components:** PascalCase (`ChatPanel`, `ResumePreview`)
- **Types:** PascalCase interfaces in shared package; import with `import type`
- **Constants:** UPPER_SNAKE_CASE (`FREE_CREDITS`, `CREDIT_PACKS`)
- **React:** Functional components + hooks only; provider pattern for auth
- **Express:** Router modules, middleware composition (`auth → credits → handler`), `AuthRequest` typed interface
- **Firestore:** `FieldValue.serverTimestamp()` for timestamps; transactions for credit operations
- **Deployment:** Vercel (SPA rewrites configured in `vercel.json`)
