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
