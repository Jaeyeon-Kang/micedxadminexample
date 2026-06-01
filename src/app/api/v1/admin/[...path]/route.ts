import { NextRequest, NextResponse } from "next/server";
import {
  generateLoginHistory,
  generateLoginCount,
  generateDownloadHistory,
  generateClickHistory,
  generateClickDateStat,
  generateClickButtonStat,
  generateClickUserStat,
  AI_PARTNERS,
} from "@/mock-data";

export const dynamic = "force-dynamic";

function paginate(data: unknown[], page = 0, size = 20) {
  const start = page * size;
  return { list: data.slice(start, start + size), totalCount: data.length };
}

function parseBody(body: string) {
  try { return JSON.parse(body); } catch { return {}; }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  if (joined === "ai-partners") {
    return NextResponse.json({ result: "SUCCESS", data: AI_PARTNERS });
  }

  return NextResponse.json({ result: "SUCCESS", data: {} });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  const body = parseBody(await request.text());
  const page = body.page ?? 0;
  const size = body.size ?? 20;

  // Login history
  if (joined === "login-history/search") {
    return NextResponse.json({ result: "SUCCESS", data: paginate(generateLoginHistory(50), page, size) });
  }

  // Login count
  if (joined === "login-history/count/search") {
    return NextResponse.json({ result: "SUCCESS", data: paginate(generateLoginCount(15), page, size) });
  }

  // Download history
  if (joined === "download-logs/search") {
    return NextResponse.json({ result: "SUCCESS", data: paginate(generateDownloadHistory(30), page, size) });
  }

  // Click log — multiple endpoints
  if (joined.startsWith("click-log/")) {
    const sub = joined.replace("click-log/", "");
    if (sub === "list/search") {
      return NextResponse.json({ result: "SUCCESS", data: paginate(generateClickHistory(40), page, size) });
    }
    if (sub === "date-stat/search") {
      return NextResponse.json({ result: "SUCCESS", data: { list: generateClickDateStat(14), totalCount: 14 } });
    }
    if (sub === "button-stat/search") {
      const stats = generateClickButtonStat();
      return NextResponse.json({ result: "SUCCESS", data: { list: stats, totalCount: stats.length } });
    }
    if (sub === "user-stat/search" || sub === "user-button-stat/search" || sub === "user-date-stat/search") {
      return NextResponse.json({ result: "SUCCESS", data: paginate(generateClickUserStat(20), page, size) });
    }
  }

  // Fallback
  return NextResponse.json({ result: "SUCCESS", data: { list: [], totalCount: 0 } });
}

export async function PUT() {
  return NextResponse.json({ result: "SUCCESS" });
}

export async function DELETE() {
  return NextResponse.json({ result: "SUCCESS" });
}
