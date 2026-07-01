# Project: AI-Powered Knowledge Retrieval Platform

## Vision (long-term)

Full spec: `AI-Powered Knowledge Retrieval Platform Specification - V2.docx`

The long-term vision is an enterprise-grade platform where users can upload
documents (PDF, DOCX, XLS, scans, GIS files) and search/query them using
keyword, semantic, hybrid, and natural-language search, getting RAG-based
answers with citations and confidence scores. The full spec also covers
OCR, GIS spatial search, knowledge graphs, RBAC/SSO security, multilingual
support (English/Assamese/Hindi), analytics dashboards, and workflow
automation, with a target stack of React/Next.js + FastAPI/Laravel +
PostgreSQL/pgvector + Elasticsearch + Docker/Kubernetes.

That full scope is a multi-month, multi-person build. This repo does NOT
start there. It starts with a small MVP and grows toward the vision in
phases, driven by what's actually learned and needed at each step.

## Author / context

Gunajit — complete beginner to programming, building this project primarily
to learn. Prioritize clarity and small working increments over completeness
or "enterprise correctness." When in doubt, favor the simplest thing that
works and teaches the underlying concept.

## Current scope: MVP (v0)

Goal: a single person can upload a handful of documents, search them, and
ask a natural-language question and get an answer with a source citation.

Features:
- Upload PDF / DOCX / TXT files
- Chunk + embed the text
- Keyword search + basic semantic (embedding) search
- Ask a question -> retrieve relevant chunks -> generate an answer with
  a citation back to the source document
- Minimal web UI (upload, search box, chat box) in a single app

Explicitly OUT of scope for v0: authentication/RBAC, GIS, OCR, knowledge
graph, multilingual support, analytics dashboard, Kubernetes/Docker,
workflow/approval states. These are future phases, not missing bugs.

## Tech stack (v0) — as actually built

- **Language:** JavaScript / Node.js
- **App framework:** Next.js (App Router) — UI pages + API routes in one
  project, no separate frontend/backend split, no CORS wiring to learn yet
- **Storage:** local filesystem for uploaded files (`data/uploads/`);
  SQLite for metadata + chunks (via `sqlite3`, not `better-sqlite3` —
  `better-sqlite3` requires compiling native code with Python/VS Build
  Tools, which this machine doesn't have; `sqlite3` ships prebuilt
  binaries and just works)
- **Text extraction:** `pdf-parse` (v2 API: `new PDFParse({data}).getText()`,
  not the old default-function export), `mammoth` (DOCX)
- **Embeddings / vector search:** local embedding model via
  `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, runs in-process, no
  API key/account needed); vectors stored as JSON in SQLite, cosine
  similarity computed manually in JS (`lib/embeddings.js`) — no separate
  vector DB needed at this scale
- **LLM (answer generation):** Google Gemini API via
  `@google/generative-ai` (model configurable via `GEMINI_MODEL` env var,
  default `gemini-2.5-flash`). Originally wired to Claude via
  `@anthropic-ai/sdk`, switched to Gemini per preference — the code only
  needs a `searchChunks()` result + a system prompt, so swapping LLM
  providers is a small, isolated change (see `app/api/ask/route.js`).
- **Next.js config note:** `pdf-parse` and `sqlite3` must be listed in
  `serverExternalPackages` in `next.config.mjs`, otherwise Turbopack
  breaks their native/worker-loading code.

Rationale: minimize the number of new concepts introduced at once. A
beginner should be able to run `npm run dev` and see the whole system —
upload, search, and chat UI — in one project, rather than juggling
multiple services or languages.

## Roadmap (phases after v0 works)

1. **v0 (current):** upload, search, RAG Q&A with citations — as above.
2. **Phase 1:** hybrid search (BM25 + vector), metadata filters (department/
   date/category), better answer formatting (executive summary, key facts,
   confidence, "information not found" handling per the spec's Section 15
   hallucination policy).
3. **Phase 2:** OCR for scanned documents/images, multilingual support.
4. **Phase 3:** auth + RBAC (roles: admin/librarian/dept user/public),
   audit logs, version control/approval workflow.
5. **Phase 4:** GIS integration, knowledge graph, analytics dashboard.
6. **Phase 5:** split into a dedicated backend service (if/when the app
   outgrows Next.js API routes) and containerize with Docker.

Do not jump ahead a phase until the current one works end-to-end.

## Conventions

- Keep the app runnable from a single entry point during v0/Phase 1.
- Prefer readable code with clear names over clever abstractions —
  this codebase doubles as a learning tool.
- No premature error handling for cases that can't happen yet (e.g. no
  auth to fail if there's no auth system yet).
