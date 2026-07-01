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
