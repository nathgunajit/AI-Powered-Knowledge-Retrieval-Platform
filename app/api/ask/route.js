import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchChunks } from "@/lib/search";

const INSUFFICIENT_INFO =
  "Insufficient information found in the available documents to answer this query accurately.";

const SYSTEM_PROMPT = `You answer questions using ONLY the provided document excerpts.
Rules:
- Never fabricate information beyond what is in the excerpts.
- Always cite which document(s) your answer came from.
- If the excerpts don't contain enough information to answer, set both
  shortDescription and longDescription to exactly:
  "${INSUFFICIENT_INFO}"

Respond with JSON matching this shape:
{
  "shortDescription": "a 1-2 sentence executive summary of the answer",
  "longDescription": "a fuller, detailed answer (key facts, numbers, context), still grounded only in the excerpts"
}`;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request) {
  const { query } = await request.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const matches = await searchChunks(query, 5);

  if (matches.length === 0) {
    return NextResponse.json({
      shortDescription: INSUFFICIENT_INFO,
      longDescription: INSUFFICIENT_INFO,
      citations: [],
    });
  }

  const context = matches
    .map((m, i) => `[${i + 1}] (${m.documentName}, chunk ${m.chunkIndex})\n${m.text}`)
    .join("\n\n");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  let shortDescription;
  let longDescription;
  try {
    const result = await model.generateContent(
      `Question: ${query}\n\nDocument excerpts:\n${context}`
    );
    const parsed = JSON.parse(result.response.text());
    shortDescription = parsed.shortDescription;
    longDescription = parsed.longDescription;
  } catch (err) {
    return NextResponse.json(
      { error: `Gemini API error: ${err.message}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    shortDescription,
    longDescription,
    citations: matches.map((m) => ({
      documentName: m.documentName,
      chunkIndex: m.chunkIndex,
      score: m.score,
    })),
  });
}
