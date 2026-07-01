import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchChunks } from "@/lib/search";

const SYSTEM_PROMPT = `You answer questions using ONLY the provided document excerpts.
Rules:
- Never fabricate information beyond what is in the excerpts.
- Always cite which document(s) your answer came from.
- If the excerpts don't contain enough information to answer, reply exactly:
  "Insufficient information found in the available documents to answer this query accurately."
Keep answers concise (2-5 sentences).`;

export async function POST(request) {
  const { query } = await request.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const matches = await searchChunks(query, 5);

  if (matches.length === 0) {
    return NextResponse.json({
      answer: "Insufficient information found in the available documents to answer this query accurately.",
      citations: [],
    });
  }

  const context = matches
    .map((m, i) => `[${i + 1}] (${m.documentName}, chunk ${m.chunkIndex})\n${m.text}`)
    .join("\n\n");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let answer;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Question: ${query}\n\nDocument excerpts:\n${context}`,
        },
      ],
    });
    answer = response.content[0].text;
  } catch (err) {
    return NextResponse.json(
      { error: `Claude API error: ${err.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    answer,
    citations: matches.map((m) => ({
      documentName: m.documentName,
      chunkIndex: m.chunkIndex,
      score: m.score,
    })),
  });
}
