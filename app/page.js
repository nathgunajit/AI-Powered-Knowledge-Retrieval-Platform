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
      setStatus(`Uploaded "${data.originalName}"`);
      form.reset();
      loadDocuments();
    } else {
      setStatus(`Error: ${data.error}`);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-6">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Knowledge Retrieval Platform
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Upload a document (PDF, DOCX, or TXT) to get started.
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
                  <span className="text-zinc-500">
                    {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
