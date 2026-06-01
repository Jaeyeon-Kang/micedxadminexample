"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const BYPASS_PREFIXES = ["/portal", "/entry"];

type Status = "checking" | "authenticated" | "unauthenticated";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  const bypass = BYPASS_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (bypass) return;
    let cancelled = false;

    fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const ok = json?.data?.authenticated === true;
        setStatus(ok ? "authenticated" : "unauthenticated");
        if (!ok) router.replace("/portal");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bypass, router]);

  if (bypass) return <>{children}</>;
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400">불러오는 중…</span>
      </div>
    );
  }
  return <>{children}</>;
}
