"use client";

import { useEffect, useState } from "react";

const AIGATE_DEMO_ORIGIN = "https://aigate-demo.vercel.app";

export default function AiGateDashboardPage() {
  const [token, setToken] = useState("");
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setToken(j?.data?.sessionToken ?? ""))
      .catch(() => {});
  }, []);

  const goToAiGate = () => {
    setMoving(true);
    // 관리자 세션 토큰을 그대로 AI Gate의 entryToken으로 전달 → 별도 앱(다른 도메인)에 재로그인 없이 진입
    const entryToken = token || `demo-xapp-${Date.now().toString(36)}`;
    const url = `${AIGATE_DEMO_ORIGIN}/entry?entryToken=${encodeURIComponent(entryToken)}`;
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-5 shrink-0">
        <h2 className="text-lg font-bold">AI 게이트 대시보드</h2>
        <p className="text-xs text-gray-500 mt-1">
          관리자 세션을 그대로 이어받아 AI Gate(별도 도메인)로 이동합니다.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">🔐 → 🔗</div>
          <h3 className="text-base font-bold text-gray-900 mb-2">크로스 앱 SSO 이동</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            현재 관리자 세션 토큰을 AI Gate의 <code className="bg-gray-100 px-1 rounded text-gray-700">entryToken</code>으로
            전달해, 다른 도메인의 AI Gate에 재로그인 없이 진입합니다.
          </p>

          {token && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
              <span className="text-[11px] text-gray-400">현재 세션 토큰</span>
              <code className="text-xs font-mono text-orange-600">{token}</code>
            </div>
          )}

          <button
            onClick={goToAiGate}
            disabled={moving}
            className="w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {moving ? "AI Gate로 이동 중…" : "AI Gate로 이동 →"}
          </button>
          <p className="mt-3 text-[11px] text-gray-400">
            AI Gate가 이 토큰을 받아 자체 세션으로 교환합니다 (동일 SSO 메커니즘).
          </p>
        </div>
      </div>
    </div>
  );
}
