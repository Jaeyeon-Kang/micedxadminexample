import { NextResponse } from "next/server";
import { DEMO_USER } from "@/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    result: "SUCCESS",
    data: { authenticated: true, user: DEMO_USER },
  });
}
