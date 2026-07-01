import { NextResponse } from "next/server";
import { searchChunks } from "@/lib/search";

export async function POST(request) {
  const { query } = await request.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const results = await searchChunks(query);
  return NextResponse.json({ results });
}
