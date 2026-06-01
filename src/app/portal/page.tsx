"use client";

import { useState } from "react";

export default function PortalPage() {
  const [issuing, setIssuing] = useState(false);

  const enterAdmin = () => {
    setIssuing(true);
    // 실제 환경: MICE DX 본체가 로그인 세션으로 1회용 entryToken 발급
    // 데모: 동일 형식의 가짜 토큰을 클라이언트에서 생성
    const token = `demo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
    setTimeout(() => {
      window.location.href = `/entry?entryToken=${encodeURIComponent(token)}&returnTo=/dashboard`;
    }, 600);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-[#1a1a1a] px-8 py-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
              MX
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight">MICE DX 포털</h1>
              <p className="text-gray-400 text-xs">이즈피엠피 통합 업무 플랫폼 (데모)</p>
            </div>
            <span className="ml-auto text-[11px] text-emerald-300 bg-emerald-900/40 px-2.5 py-1 rounded-full">
              로그인됨 · 데모 관리자
            </span>
          </div>

          <div className="px-8 py-8">
            <div className="mb-6 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-800 leading-relaxed">
              <strong>SSO 진입 데모</strong><br />
              실제 환경에서는 MICE DX에 로그인한 관리자가 아래 버튼으로 <b>AXDX 관리자 포털</b>에 진입합니다.
              MICE DX가 1회용 <code className="bg-white px-1 rounded text-orange-700">entryToken</code>을 발급하고,
              관리자 포털이 이를 세션으로 교환합니다. (재로그인 없음)
            </div>

            <div className="flex items-center justify-center gap-4 mb-8 text-center">
              <div>
                <div className="text-2xl mb-1">🏢</div>
                <div className="text-xs font-semibold text-gray-700">MICE DX</div>
                <div className="text-[10px] text-gray-400">로그인 + 토큰 발급</div>
              </div>
              <div className="text-orange-400 text-xl">→</div>
              <div>
                <div className="text-2xl mb-1">🛠️</div>
                <div className="text-xs font-semibold text-gray-700">AXDX 관리자</div>
                <div className="text-[10px] text-gray-400">토큰 교환 + 세션</div>
              </div>
            </div>

            <button
              onClick={enterAdmin}
              disabled={issuing}
              className="w-full rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {issuing ? "entryToken 발급 중…" : "관리자 포털 진입 →"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          이 포털은 진입 흐름 시연을 위한 가짜 출발지 페이지입니다.
        </p>
      </div>
    </main>
  );
}
