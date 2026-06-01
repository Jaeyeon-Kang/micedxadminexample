import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT() {
  return NextResponse.json({ result: "SUCCESS" });
}
