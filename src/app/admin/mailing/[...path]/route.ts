import { NextRequest, NextResponse } from "next/server";
import { generateMailHistory, MAIL_TEMPLATES, generateRecipients } from "@/mock-data";

export const dynamic = "force-dynamic";

function parseBody(text: string) {
  try { return JSON.parse(text); } catch { return {}; }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // GET /admin/mailing/templates
  if (joined === "templates") {
    return NextResponse.json({ result: "SUCCESS", data: MAIL_TEMPLATES });
  }

  // GET /admin/mailing/templates/{type}/recipients
  const recipientMatch = joined.match(/^templates\/(\w+)\/recipients$/);
  if (recipientMatch) {
    return NextResponse.json({
      result: "SUCCESS",
      data: generateRecipients(recipientMatch[1]),
    });
  }

  return NextResponse.json({ result: "SUCCESS", data: {} });
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");

  // POST /admin/mailing/history
  if (joined === "history") {
    const body = parseBody(await request.text());
    const page = body.page ?? 0;
    const size = body.size ?? 20;
    const all = generateMailHistory(25);
    const start = page * size;
    return NextResponse.json({
      result: "SUCCESS",
      data: { list: all.slice(start, start + size), totalCount: all.length },
    });
  }

  // POST /admin/mailing/send (test send)
  if (joined === "send") {
    return NextResponse.json({ result: "SUCCESS", message: "데모: 메일 발송 시뮬레이션 완료" });
  }

  // POST /admin/mailing/templates/{type}/update
  if (joined.match(/^templates\/\w+\/update$/)) {
    return NextResponse.json({ result: "SUCCESS" });
  }

  // POST /admin/mailing/templates/{type}/recipients/create
  if (joined.match(/^templates\/\w+\/recipients\/create$/)) {
    return NextResponse.json({ result: "SUCCESS", data: { id: Date.now() } });
  }

  // POST /admin/mailing/templates/{type}/recipients/{id}/update
  if (joined.match(/^templates\/\w+\/recipients\/\d+\/update$/)) {
    return NextResponse.json({ result: "SUCCESS" });
  }

  // POST /admin/mailing/recipients/{id}/delete
  if (joined.match(/^recipients\/\d+\/delete$/)) {
    return NextResponse.json({ result: "SUCCESS" });
  }

  // POST /admin/mailing/recipients/bulk-delete
  if (joined === "recipients/bulk-delete") {
    return NextResponse.json({ result: "SUCCESS" });
  }

  return NextResponse.json({ result: "SUCCESS" });
}
