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
