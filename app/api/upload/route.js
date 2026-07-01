import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { insertDocument, insertChunk, updateDocumentStatus } from "@/lib/db";
import { extractText } from "@/lib/textExtraction";
import { chunkText } from "@/lib/chunking";
import { embedText } from "@/lib/embeddings";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

async function processDocument(doc, filePath) {
  try {
    const text = await extractText(filePath);
    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      await insertChunk({
        id: crypto.randomUUID(),
        documentId: doc.id,
        chunkIndex: i,
        text: chunks[i],
        embedding,
      });
    }

    await updateDocumentStatus(doc.id, "ready");
    return { status: "ready" };
  } catch (err) {
    await updateDocumentStatus(doc.id, "error", err.message);
    return { status: "error", error: err.message };
  }
}

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const id = crypto.randomUUID();
  const storedName = `${id}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(filePath, buffer);

  const doc = await insertDocument({
    id,
    originalName: file.name,
    storedName,
    size: buffer.length,
    mimeType: file.type || null,
    uploadedAt: new Date().toISOString(),
    status: "processing",
  });

  // Chunk + embed before responding so the UI knows the final status
  // immediately (fine at MVP scale; move to a background job later).
  const result = await processDocument(doc, filePath);

  return NextResponse.json({ ...doc, ...result }, { status: 201 });
}
