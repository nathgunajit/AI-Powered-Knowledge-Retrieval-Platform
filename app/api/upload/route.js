import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { insertDocument } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

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
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  const doc = await insertDocument({
    id,
    originalName: file.name,
    storedName,
    size: buffer.length,
    mimeType: file.type || null,
    uploadedAt: new Date().toISOString(),
  });

  return NextResponse.json(doc, { status: 201 });
}
