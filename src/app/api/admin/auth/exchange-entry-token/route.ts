import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const entryToken = request.nextUrl.searchParams.get("entryToken") || "";
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;

  if (!entryToken) {
    return NextResponse.redirect(new URL("/entry/failure?reason=missing-token", baseUrl));
  }

  // 데모: entryToken을 그대로 세션 토큰으로 사용 (실제로는 백엔드가 새 세션 발급)
  const res = NextResponse.redirect(new URL(returnTo, baseUrl));
  res.cookies.set(SESSION_COOKIE, entryToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return res;
}

export async function POST() {
  return NextResponse.json({ result: "SUCCESS" });
}
