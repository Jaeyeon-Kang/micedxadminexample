import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/mock-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  // SSO 진입(세션 쿠키)이 없으면 가짜 출발지 포털로
  redirect(session ? "/dashboard" : "/portal");
}
