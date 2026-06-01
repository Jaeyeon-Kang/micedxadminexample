import { NextRequest, NextResponse } from "next/server";
import { generateAIGateLogs } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "0");
  const size = Number(request.nextUrl.searchParams.get("size") ?? "20");
  const allLogs = generateAIGateLogs(80);
  const start = page * size;
  const list = allLogs.slice(start, start + size);

  return NextResponse.json({
    result: "SUCCESS",
    data: { list, totalCount: allLogs.length },
  });
}
