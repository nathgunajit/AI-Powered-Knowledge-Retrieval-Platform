import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/db";

export async function GET() {
  const documents = await listDocuments();
  return NextResponse.json(documents);
}
