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

## Tech stack (v0)

- **Language:** Python
- **App framework:** Streamlit (single app — UI + logic in one place,
  no separate frontend/backend split, no CORS/API wiring to learn yet)
- **Storage:** local filesystem for uploaded files; SQLite for metadata
- **Embeddings / vector search:** chromadb (local, no server to run)
- **LLM:** Claude API (for answer generation over retrieved chunks)

Rationale: minimize the number of new concepts introduced at once. A
beginner should be able to run `streamlit run app.py` and see the whole
system, rather than juggling multiple services.

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
6. **Phase 5:** move off Streamlit to a real frontend/backend split
   (React/Next.js + FastAPI) if/when the app outgrows a single-page app;
   containerize with Docker.

Do not jump ahead a phase until the current one works end-to-end.

## Conventions

- Keep the app runnable from a single entry point during v0/Phase 1.
- Prefer readable code with clear names over clever abstractions —
  this codebase doubles as a learning tool.
- No premature error handling for cases that can't happen yet (e.g. no
  auth to fail if there's no auth system yet).
