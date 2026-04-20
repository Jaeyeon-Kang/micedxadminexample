"use client";

import { useState } from "react";

const TEMPLATES = [
  {
    id: "PROJECT_CREATED",
    name: "신규 프로젝트 등록 안내",
    subject: "[EZ데이터허브] 신규 프로젝트 등록 안내 : {프로젝트명} ({코드})",
    body: `안녕하세요, 담당자님

하기 프로젝트가 신규 등록되었습니다.

1. 신규 등록 프로젝트 : {프로젝트명} ({코드})
2. 등록 일시 : {등록일}
3. 코드발급 기한 : {기한일}

해당 프로젝트의 신규 프로젝트코드를 발급해주시기 바랍니다.

감사합니다.`,
    status: "활성",
  },
  {
    id: "BID_RESULT_ENTERED",
    name: "프로젝트 코드 발급 완료",
    subject: "[EZ데이터허브] 프로젝트 코드 발급 완료 안내 : {프로젝트명} ({코드})",
    body: `안녕하세요, 담당자님

하기 프로젝트의 프로젝트 코드가 발급되었습니다.
PRS에 로그인하여 구성원 입력을 진행해주시기 바랍니다.

1. 제출 프로젝트 : {프로젝트명} ({코드})
2. 발급 일시 : {발급일}
3. 입력 기한 : {기한일}

감사합니다.`,
    status: "활성",
  },
  {
    id: "PROPOSAL_SUBMITTED",
    name: "제안서 제출 완료 확인",
    subject: "[EZ데이터허브] 제안서 제출 완료 확인 요청 : {프로젝트명} ({코드})",
    body: `안녕하세요, 담당자님
하기 프로젝트의 제안서 제출이 완료되었습니다

1. 제출 프로젝트 : {프로젝트명} ({코드})
2. 제출 일시 : {제출일}

문서를 확인하시고 저작권 등록을 진행해주시기 바랍니다.

감사합니다.`,
    status: "활성",
  },
  {
    id: "BA_PROPOSAL_SUBMITTED",
    name: "제안서 저작권 등록 완료",
    subject: "[EZ데이터허브] 제안서 저작권 등록 완료 안내 : {프로젝트명} ({코드})",
    body: "...",
    status: "활성",
  },
  {
    id: "PERFORMANCE_REPORT_SUBMITTED",
    name: "수행내역서 제출 완료",
    subject: "[EZ데이터허브] 수행내역서 제출 완료 확인 요청 : {프로젝트명} ({코드})",
    body: "...",
    status: "활성",
  },
  {
    id: "OPERATION_DATA_SUBMITTED",
    name: "운영자료 제출 완료",
    subject: "[EZ데이터허브] 운영자료 제출 완료 확인 요청 : {프로젝트명} ({코드})",
    body: "...",
    status: "활성",
  },
];

export default function MailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [editBody, setEditBody] = useState(TEMPLATES[0].body);
  const [editSubject, setEditSubject] = useState(TEMPLATES[0].subject);

  const handleSelect = (template: (typeof TEMPLATES)[0]) => {
    setSelectedTemplate(template);
    setEditBody(template.body);
    setEditSubject(template.subject);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">메일 템플릿 관리</h2>
        <p className="text-xs text-gray-500 mt-1">메일 발송에 사용되는 템플릿을 관리하는 화면입니다.</p>
      </div>

      <div className="flex gap-5">
        {/* Template List */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-[11px] font-medium text-gray-500">템플릿 목록 ({TEMPLATES.length})</p>
          </div>
          <div>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedTemplate.id === t.id
                    ? "bg-orange-50 border-l-2 border-l-orange-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className={`text-[13px] ${selectedTemplate.id === t.id ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{t.name}</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{t.id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-gray-900">{selectedTemplate.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
              selectedTemplate.status === "활성" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
            }`}>
              {selectedTemplate.status}
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">메일 제목 패턴</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                메일 본문 <span className="text-gray-400 font-normal">(변수: {"{프로젝트명}"}, {"{코드}"}, {"{등록일}"}, {"{기한일}"})</span>
              </label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={12}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button className="bg-gray-900 text-white px-5 py-1.5 rounded text-sm hover:bg-black transition-colors">
                템플릿 저장
              </button>
              <button className="bg-white text-gray-600 px-5 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors border border-gray-300">
                미리보기
              </button>
              <button className="bg-white text-gray-600 px-5 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors border border-gray-300">
                테스트 발송
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
