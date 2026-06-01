import { NextResponse } from "next/server";
import { AI_PARTNERS } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ result: "SUCCESS", data: AI_PARTNERS });
}

export async function POST() {
  return NextResponse.json({ result: "SUCCESS", data: { id: Date.now() } });
}
