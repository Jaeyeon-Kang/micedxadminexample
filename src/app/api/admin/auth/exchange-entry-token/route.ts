import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Demo: always succeed, redirect to home
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const baseUrl = `${proto}://${host}`;
  return NextResponse.redirect(new URL(returnTo, baseUrl));
}

export async function POST() {
  return NextResponse.json({ result: "SUCCESS" });
}
