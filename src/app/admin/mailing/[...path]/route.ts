import { NextRequest, NextResponse } from "next/server";
import { generateMailHistory, generateMailTemplates, generateRecipients } from "@/mock-data";

export const dynamic = "force-dynamic";

function parseBody(text: string) {
  try { return JSON.parse(text); } catch { return {}; }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // GET /admin/mailing/templates → MailTemplate[] (top-level array)
  if (joined === "templates") {
    return NextResponse.json(generateMailTemplates());
  }

  // GET /admin/mailing/templates/{type}/recipients → { TO, CC, BCC }
  const recipientMatch = joined.match(/^templates\/([\w-]+)\/recipients$/);
  if (recipientMatch) {
    return NextResponse.json(generateRecipients(recipientMatch[1]));
  }

  return NextResponse.json({ result: "SUCCESS" });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // POST /admin/mailing/history → { list, totalCount } (top-level)
  if (joined === "history") {
    const body = parseBody(await request.text());
    const page = body.page ?? 0;
    const size = body.size ?? 20;
    const all = generateMailHistory(25);
    const start = page * size;
    return NextResponse.json({
      list: all.slice(start, start + size),
      totalCount: all.length,
    });
  }

  // POST /admin/mailing/send (test send)
  if (joined === "send") {
    return NextResponse.json({ result: "SUCCESS", message: "데모: 메일 발송 시뮬레이션 완료" });
  }

  // template update / recipient CRUD — all no-op success
  return NextResponse.json({ result: "SUCCESS" });
}
