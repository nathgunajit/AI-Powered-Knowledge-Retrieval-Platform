import { NextResponse } from "next/server";
import { getAllChunksWithDocuments } from "@/lib/db";
import { embedText, cosineSimilarity } from "@/lib/embeddings";

const TOP_K = 5;

export async function POST(request) {
  const { query } = await request.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const chunks = await getAllChunksWithDocuments();
  if (chunks.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const queryEmbedding = await embedText(query);

  const scored = chunks.map((chunk) => ({
    documentName: chunk.originalName,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({ results: scored.slice(0, TOP_K) });
}
