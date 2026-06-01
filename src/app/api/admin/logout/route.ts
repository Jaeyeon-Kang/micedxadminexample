import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const res = NextResponse.redirect(new URL("/portal", `${proto}://${host}`));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
