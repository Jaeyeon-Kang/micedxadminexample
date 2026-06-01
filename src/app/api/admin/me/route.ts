import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER, SESSION_COOKIE } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);
  if (!session) {
    return NextResponse.json({ result: "SUCCESS", data: { authenticated: false } });
  }
  return NextResponse.json({
    result: "SUCCESS",
    data: { authenticated: true, user: DEMO_USER, sessionToken: session.value },
  });
}
