"use client";

import { useState } from "react";

export default function MailSettingsPage() {
  const [smtpHost, setSmtpHost] = useState("outbound.daouoffice.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("ezpmp.ict@ezpmp.co.kr");
  const [senderName, setSenderName] = useState("데이터 허브 관리자");
  const [senderAddress, setSenderAddress] = useState("ezpmp.ict@ezpmp.co.kr");
  const [security, setSecurity] = useState("SSL");
  const [enabled, setEnabled] = useState(true);

  const RECENT_MAILS = [
    { type: "PROJECT_CREATED", to: "cskim@ezpmp.co.kr", subject: "[EZ데이터허브] 신규 프로젝트 등록 안내 : 2026-ICT-001", status: "성공", time: "2026-04-10 09:15" },
    { type: "BID_RESULT_ENTERED", to: "yhlee@ezpmp.co.kr", subject: "[EZ데이터허브] 프로젝트 코드 발급 완료 안내 : 2026-ENG-042", status: "성공", time: "2026-04-10 09:30" },
    { type: "PROPOSAL_SUBMITTED", to: "mspark@ezpmp.co.kr", subject: "[EZ데이터허브] 제안서 제출 완료 확인 요청", status: "실패", time: "2026-04-10 10:00" },
    { type: "PERFORMANCE_REPORT", to: "syjung@ezpmp.co.kr", subject: "[EZ데이터허브] 수행내역서 제출 완료 확인 요청", status: "성공", time: "2026-04-10 10:20" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">메일 설정</h2>
        <p className="text-xs text-gray-500 mt-1">SMTP 서버 및 발신자 정보를 설정하는 화면입니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* SMTP Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">SMTP 설정</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">보안</label>
                <select
                  value={security}
                  onChange={(e) => setSecurity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                >
                  <option>SSL</option>
                  <option>TLS</option>
                  <option>NONE</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">SMTP 계정</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">SMTP 비밀번호</label>
              <input
                type="password"
                value="••••••••"
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Sender Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">발신자 설정</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">발신자 이름</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">발신자 이메일</label>
              <input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <label className="text-[11px] font-medium text-gray-600">메일 발송 활성화</label>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  enabled ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    enabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 flex gap-2">
              <button className="bg-gray-900 text-white px-5 py-1.5 rounded text-sm hover:bg-black transition-colors">
                설정 저장
              </button>
              <button className="bg-white text-gray-600 px-5 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors border border-gray-300">
                테스트 메일 발송
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Mail Logs */}
      <div className="mt-5 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-[13px] font-semibold text-gray-900">최근 발송 내역</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 text-center">
              <th className="px-4 py-2.5 font-medium">타입</th>
              <th className="px-4 py-2.5 font-medium">수신자</th>
              <th className="px-4 py-2.5 font-medium text-left">제목</th>
              <th className="px-4 py-2.5 font-medium">상태</th>
              <th className="px-4 py-2.5 font-medium">일시</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_MAILS.map((mail, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                <td className="px-4 py-2.5 font-mono text-gray-500 text-[11px]">{mail.type}</td>
                <td className="px-4 py-2.5 text-gray-600">{mail.to}</td>
                <td className="px-4 py-2.5 text-gray-700 text-left max-w-xs truncate">{mail.subject}</td>
                <td className="px-4 py-2.5 text-gray-600">{mail.status}</td>
                <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{mail.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
