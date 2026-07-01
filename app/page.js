"use client";

import { useEffect, useState } from "react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  async function loadDocuments() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const file = form.file.files[0];
    if (!file) return;

    setUploading(true);
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setStatus(
        data.status === "ready"
          ? `Uploaded and processed "${data.originalName}"`
          : `Uploaded "${data.originalName}" but processing failed: ${data.error}`
      );
      form.reset();
      loadDocuments();
    } else {
      setStatus(`Error: ${data.error}`);
    }
    setUploading(false);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(res.ok ? data.results : []);
    setSearching(false);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-6">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Knowledge Retrieval Platform
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Upload a document (PDF, DOCX, or TXT), then search across it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,.txt"
            className="text-sm text-zinc-700 dark:text-zinc-300"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {status && <p className="text-sm text-zinc-600 dark:text-zinc-400">{status}</p>}

        <div>
          <h2 className="mb-3 text-lg font-medium text-black dark:text-zinc-50">
            Uploaded documents
          </h2>
          {documents.length === 0 ? (
            <p className="text-sm text-zinc-500">No documents uploaded yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded border border-black/[.08] px-4 py-2 text-sm dark:border-white/[.145]"
                >
                  <span className="text-black dark:text-zinc-50">{doc.originalName}</span>
                  <span className="flex items-center gap-2 text-zinc-500">
                    {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleString()}
                    <span
                      className={
                        doc.status === "ready"
                          ? "text-green-600"
                          : doc.status === "error"
                          ? "text-red-600"
                          : "text-amber-600"
                      }
                    >
                      · {doc.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-medium text-black dark:text-zinc-50">Search</h2>
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask something about your documents..."
              className="flex-1 rounded border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145] dark:bg-zinc-900 dark:text-zinc-50"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {results && (
            <ul className="mt-4 flex flex-col gap-3">
              {results.length === 0 ? (
                <p className="text-sm text-zinc-500">No matching content found.</p>
              ) : (
                results.map((r, i) => (
                  <li
                    key={i}
                    className="rounded border border-black/[.08] px-4 py-3 text-sm dark:border-white/[.145]"
                  >
                    <div className="mb-1 flex justify-between text-xs text-zinc-500">
                      <span>
                        {r.documentName} (chunk {r.chunkIndex})
                      </span>
                      <span>score: {r.score.toFixed(3)}</span>
                    </div>
                    <p className="text-black dark:text-zinc-50">{r.text}</p>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
