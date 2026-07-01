import { getAllChunksWithDocuments } from "@/lib/db";
import { embedText, cosineSimilarity } from "@/lib/embeddings";

export async function searchChunks(query, topK = 5) {
  const chunks = await getAllChunksWithDocuments();
  if (chunks.length === 0) return [];

  const queryEmbedding = await embedText(query);

  const scored = chunks.map((chunk) => ({
    documentName: chunk.originalName,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
