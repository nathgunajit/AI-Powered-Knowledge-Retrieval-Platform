# Project Activity Log

Chronological record of decisions and actions taken on this project.
Newest entries at the bottom. Keep entries short — what was done and why.

---

## 2026-07-01

- Read `AI-Powered Knowledge Retrieval Platform Specification - V2.docx`
  (the original enterprise-scale spec) and summarized it.
- Decided to scope down to a small MVP (v0) instead of building the full
  spec as-is, since the author is a complete beginner and the full spec is
  a multi-month enterprise build. Full spec kept as long-term roadmap.
- Created `CLAUDE.md` documenting: vision, MVP scope, tech stack, phased
  roadmap (v0 -> hybrid search -> OCR/multilingual -> auth/RBAC ->
  GIS/knowledge graph/analytics -> service split + Docker), and
  conventions.
- Initialized local git repo (`git init`), added `.gitignore`, committed
  the spec doc + `CLAUDE.md` as the initial commit.
- Created GitHub repo and pushed:
  https://github.com/nathgunajit/AI-Powered-Knowledge-Retrieval-Platform
- Changed MVP tech stack from Python/Streamlit to Node.js/Next.js per
  preference. Updated `CLAUDE.md` accordingly (Next.js App Router,
  better-sqlite3, local JS vector store, @anthropic-ai/sdk) and pushed.
- Created this log file to track future actions/decisions.

**Current state:** planning complete, no application code written yet.
**Next step:** scaffold the Next.js MVP app (upload -> chunk/embed ->
search -> Q&A with citation).

## 2026-07-01 (later)

- Agreed on a working rule: ask for approval before any step needing
  network/system access or that creates files outside the project folder.
  Saved as a standing memory for future sessions.
- Scaffolded the Next.js app (App Router, Tailwind, ESLint, JS not TS) via
  `create-next-app`, after getting approval since it needs npm/network
  access. Had to generate it in a temp folder first (create-next-app
  refuses non-empty directories) then merge the generated files into the
  project root, keeping our existing `CLAUDE.md`/`PROJECT_LOG.md` instead
  of the tool's stub versions.
- Ran `npm install` in the project folder, then started the dev server
  and confirmed `http://localhost:3000` returns HTTP 200 before committing.
- Renamed the app in `package.json` from the default `nextapp` to
  `ai-knowledge-retrieval-platform`.
- Committed and pushed the scaffold.

**Current state:** Next.js app boots (default starter page). No upload/
search/RAG features built yet.
**Next step:** build the upload -> chunk/embed -> search -> Q&A flow.

## 2026-07-01 (upload feature)

- Tried `better-sqlite3`, install failed: needs native compilation
  (Python + Visual Studio Build Tools not present on this machine).
  Rather than asking to install heavy system build tools, switched to
  the `sqlite3` package, which ships prebuilt binaries — installed and
  verified working with no compile step.
- Built the upload feature:
  - `lib/db.js` — SQLite connection + `documents` table (id, name,
    stored name, size, mimeType, uploadedAt).
  - `POST /api/upload` — validates file type (.pdf/.docx/.txt), saves
    to `data/uploads/`, records metadata in SQLite.
  - `GET /api/documents` — lists uploaded documents.
  - Home page (`app/page.js`) — upload form + list of uploaded docs.
- Verified end-to-end with curl: valid `.txt` upload succeeds, appears
  in the list, and the file lands in `data/uploads/`; a disallowed
  `.exe` upload is correctly rejected with an error message.
- Committed and pushed.

**Current state:** upload feature works (store file + metadata, list
uploads). No text extraction, chunking, embeddings, or search/Q&A yet.
**Next step:** extract text from uploaded PDFs/DOCX/TXT, chunk it, and
generate embeddings so search becomes possible.

## 2026-07-01 (extraction, chunking, embeddings, search)

- Installed `pdf-parse`, `mammoth` (text extraction) and
  `@xenova/transformers` (local embedding model, no API key/account
  needed — runs `Xenova/all-MiniLM-L6-v2` in-process).
- Added `lib/textExtraction.js`, `lib/chunking.js` (fixed-size chunks
  w/ overlap), `lib/embeddings.js` (embed + cosine similarity).
- Upload flow now processes each file synchronously after saving:
  extract -> chunk -> embed each chunk -> store in a new `chunks`
  table in SQLite. Added `status`/`error` columns to `documents` so
  the UI can show processing/ready/error.
- Added `POST /api/search`: embeds the query, cosine-similarity ranks
  all stored chunks, returns top 5 with document name + score.
- UI: document list shows status; added a search box + ranked results.
- Had to reset the local `data/app.db` once after changing the schema
  (fine in dev; a real migration system would matter once this has
  real user data).
- Verified end-to-end: uploaded a small multi-fact `.txt` file, waited
  for `status: "ready"`, then queried "What is the approved budget for
  Udmari Beel?" and got back the exact chunk containing that fact.
  Cleaned up test data before committing.

**Current state:** can upload a document and semantically search its
content, getting back raw matching chunks + similarity scores. No LLM-
generated answer yet — search returns snippets, not a synthesized
answer with citation.
**Next step:** wire up Claude (`@anthropic-ai/sdk`) to take the
top search results and generate a concise answer with a citation back
to the source document, per the MVP's "ask a question -> get an answer"
goal. Will need an Anthropic API key from the user for this.

## 2026-07-01 (Anthropic API key + Q&A wiring)

- Created `.env.local` (gitignored) for `ANTHROPIC_API_KEY`. Had trouble
  getting the key saved to the right file — first two save attempts via
  the IDE didn't actually write to disk (file timestamp never changed).
  Resolved by opening the exact file path directly in Notepad instead.
- Note: the key's raw value briefly passed through the session
  transcript via an automatic file-diff notification when it was saved
  (not something either of us triggered directly) — flagged to Gunajit
  as a reason to consider rotating the key later.
- Verified the key itself is valid (passes auth), but the Anthropic
  account currently has insufficient credit balance — needs credits
  added at console.anthropic.com before Claude calls will succeed.
  This is an account/billing issue, not a code issue.
- Installed `@anthropic-ai/sdk`. Added `POST /api/ask`: retrieves top
  chunks via `lib/search.js` (refactored out of `/api/search`), sends
  them to Claude with a hallucination-prevention system prompt (only
  answer from provided excerpts, cite sources, say so if insufficient
  info — per the original spec's section 15 policy), returns answer +
  citations. UI now shows a synthesized answer instead of raw snippets.
- **Found and fixed a real bug** while testing: Gunajit uploaded his own
  CV (`Gunajit_Nath_CV_IT_EXPERT.pdf`) through the browser and it failed
  with "pdfParse is not a function". Root cause: the installed
  `pdf-parse` is v2, which replaced the old default-function export
  with a `PDFParse` class (`new PDFParse({ data }).getText()`). Fixed
  `lib/textExtraction.js` accordingly.
- Hit a second bug on retry: Turbopack broke `pdf-parse`'s internal
  PDF.js worker loading ("Setting up fake worker failed"). Fixed by
  adding `serverExternalPackages: ["pdf-parse", "sqlite3"]` to
  `next.config.mjs` so Next.js doesn't try to bundle these.
- Re-verified end-to-end using the real CV PDF: extraction, chunking,
  embedding, and search all returned correct, relevant results (e.g.
  a query about "years of experience" correctly surfaced the "11+
  years" chunk as the top match).
- Cleaned up two broken intermediate upload attempts, kept the working
  processed CV record.
- Added `.claude/settings.local.json` (machine-local permissions) to
  `.gitignore` — not project code, shouldn't be committed.

**Current state:** full pipeline works end-to-end — upload (PDF/DOCX/
TXT) -> extract -> chunk -> embed -> semantic search -> Claude answer
generation with citations — except the final Claude call is blocked by
Gunajit's account credit balance, not by anything in the code.
**Next step:** once credits are added, do a full manual test of the
"Ask a question" UI in the browser. After that, Phase 1 work per
`CLAUDE.md`'s roadmap (hybrid search, metadata filters, better answer
formatting).
