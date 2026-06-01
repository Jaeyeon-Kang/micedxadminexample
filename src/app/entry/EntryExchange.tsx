"use client";

import { useEffect, useState } from "react";

export default function EntryExchange({
  entryToken,
  returnTo,
}: {
  entryToken: string;
  returnTo: string;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1500);
    const t3 = setTimeout(() => {
      const target = new URLSearchParams({ entryToken, returnTo });
      window.location.href = `/api/admin/auth/exchange-entry-token?${target.toString()}`;
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [entryToken, returnTo]);

  const steps = [
    "MICE DX가 발급한 entryToken 수신",
    "백엔드에 토큰 교환 요청 (exchange-entry-token)",
    "세션 쿠키 발급 완료 · 관리자 포털로 진입",
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            🛠️
          </div>
          <div>
            <h1 className="font-bold text-gray-800">SSO 진입 처리 중</h1>
            <p className="text-xs text-gray-400">entryToken을 세션으로 교환합니다</p>
          </div>
        </div>

        <div className="mb-5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <p className="text-[10px] text-gray-400 mb-0.5">수신한 entryToken</p>
          <code className="text-xs text-orange-700 break-all">{entryToken}</code>
        </div>

        <ul className="space-y-3">
          {steps.map((label, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  step >= i ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > i ? "✓" : i + 1}
              </span>
              <span className={step >= i ? "text-gray-700" : "text-gray-400"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
