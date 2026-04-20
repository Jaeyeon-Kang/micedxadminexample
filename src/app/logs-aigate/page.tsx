"use client";

import { useState } from "react";

const MOCK_AIGATE_LOGS = [
  {
    id: 1, userKey: "U001", userName: "김철수", departmentName: "ICT사업부", positionName: "과장",
    occurredAt: "2026-04-10 09:20:00", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "프리패스 정산서 진입", fpProjectCode: "2026-ICT-001", fpProjectName: "스마트시티 플랫폼",
    menuName: "HOME", buttonName: "-", durationMs: 12500, rating: null, errorCode: null, clientIp: "192.168.1.10",
  },
  {
    id: 2, userKey: "U002", userName: "이영희", departmentName: "엔지니어링", positionName: "대리",
    occurredAt: "2026-04-10 09:35:15", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "정산서 AI 검토", fpProjectCode: "2026-ENG-042", fpProjectName: "공공데이터 연계",
    menuName: "정산서 목록", buttonName: "AI 검토 요청", durationMs: 45200, rating: null, errorCode: null, clientIp: "192.168.1.22",
  },
  {
    id: 3, userKey: "U003", userName: "박민수", departmentName: "ICT사업부", positionName: "차장",
    occurredAt: "2026-04-10 09:50:30", toolType: "EXTERNAL", toolName: "EZ인의 AI 도구 완전 정복",
    purpose: "AI 서비스 검색", fpProjectCode: "-", fpProjectName: "-",
    menuName: "-", buttonName: "-", durationMs: 8300, rating: null, errorCode: null, clientIp: "192.168.1.15",
  },
  {
    id: 4, userKey: "U004", userName: "정수연", departmentName: "경영지원", positionName: "사원",
    occurredAt: "2026-04-10 10:05:45", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "정산서 생성", fpProjectCode: "2026-BIZ-018", fpProjectName: "디지털 전환 컨설팅",
    menuName: "정산서 목록", buttonName: "새 정산서", durationMs: 62000, rating: null, errorCode: null, clientIp: "192.168.1.33",
  },
  {
    id: 5, userKey: "U005", userName: "최진욱", departmentName: "ICT사업부", positionName: "과장",
    occurredAt: "2026-04-10 10:20:00", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "프로젝트 종료", fpProjectCode: "2025-ICT-099", fpProjectName: "관광 데이터 구축",
    menuName: "프로젝트 정보", buttonName: "프로젝트 종료", durationMs: 5400, rating: 4, errorCode: null, clientIp: "192.168.1.5",
  },
  {
    id: 6, userKey: "U006", userName: "홍길동", departmentName: "컨설팅", positionName: "팀장",
    occurredAt: "2026-04-10 10:35:15", toolType: "EXTERNAL", toolName: "EZ인의 AI 도구 완전 정복",
    purpose: "최신 AI 트렌드 확인", fpProjectCode: "-", fpProjectName: "-",
    menuName: "-", buttonName: "-", durationMs: 15200, rating: null, errorCode: null, clientIp: "10.61.24.50",
  },
  {
    id: 7, userKey: "U001", userName: "김철수", departmentName: "ICT사업부", positionName: "과장",
    occurredAt: "2026-04-10 10:48:00", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "정산서 다운로드", fpProjectCode: "2026-ICT-001", fpProjectName: "스마트시티 플랫폼",
    menuName: "정산서 목록", buttonName: "Excel 다운로드", durationMs: 3200, rating: null, errorCode: null, clientIp: "192.168.1.10",
  },
  {
    id: 8, userKey: "U007", userName: "강미나", departmentName: "스마트관광", positionName: "대리",
    occurredAt: "2026-04-10 11:02:30", toolType: "INTERNAL", toolName: "프리패스 정산서",
    purpose: "영수증 관리", fpProjectCode: "2026-SMT-005", fpProjectName: "관광 플랫폼 고도화",
    menuName: "전도금 영수증", buttonName: "-", durationMs: 28700, rating: null, errorCode: "FREEPASS_LOG_SAVE_FAILED", clientIp: "192.168.1.44",
  },
];

function formatDuration(ms: number | null) {
  if (ms == null) return "-";
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes <= 0) return `${secs}초`;
  if (secs === 0) return `${minutes}분`;
  return `${minutes}분 ${secs}초`;
}

export default function LogsAigatePage() {
  const [dateFrom, setDateFrom] = useState("2026-04-03");
  const [dateTo, setDateTo] = useState("2026-04-10");
  const [serviceFilter, setServiceFilter] = useState("");
  const [userName, setUserName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const filteredLogs = MOCK_AIGATE_LOGS.filter((log) => {
    const matchesSearch =
      (!userName || log.userName.includes(userName)) &&
      (!deptName || log.departmentName.includes(deptName));
    const matchesService =
      !serviceFilter ||
      (serviceFilter === "FREEPASS" && log.toolName === "프리패스 정산서") ||
      (serviceFilter === "EZ_AI_MASTERY" && log.toolName === "EZ인의 AI 도구 완전 정복");
    return matchesSearch && matchesService;
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">AI Gate 사용로그</h2>
        <p className="text-xs text-gray-500 mt-1">AI Gate 하위 서비스 사용 이력을 관리자가 확인하는 화면입니다.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">시작일</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">종료일</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">로그 대상</label>
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 w-48">
              <option value="">전체</option>
              <option value="FREEPASS">프리패스 정산서</option>
              <option value="EZ_AI_MASTERY">EZ인의 AI 도구 완전 정복</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">사용자명</label>
            <input type="text" placeholder="홍길동" value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-32 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">부서명</label>
            <input type="text" placeholder="AXDX" value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-32 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-black transition-colors h-[34px]">
              조회
            </button>
            <button className="bg-white text-gray-600 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors border border-gray-300 h-[34px]">
              초기화
            </button>
          </div>
          <button className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded text-sm hover:bg-emerald-100 transition-colors h-[34px] ml-auto">
            로그 다운로드
          </button>
        </div>
      </div>

      {/* Result Info */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">총 <span className="font-semibold text-gray-900">{filteredLogs.length}</span>건</p>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600">
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
          <option value={100}>100개씩</option>
          <option value={200}>200개씩</option>
        </select>
      </div>

      {/* Log Table - 실제 AI Gate 사용로그 16개 컬럼 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[1600px]">
          <thead>
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
              <th className="px-3 py-2.5 font-medium">UserNo</th>
              <th className="px-3 py-2.5 font-medium">사용자</th>
              <th className="px-3 py-2.5 font-medium">팀</th>
              <th className="px-3 py-2.5 font-medium">직급</th>
              <th className="px-3 py-2.5 font-medium">접속 일시</th>
              <th className="px-3 py-2.5 font-medium">유형</th>
              <th className="px-3 py-2.5 font-medium">AI 업무 파트너 명</th>
              <th className="px-3 py-2.5 font-medium">사용 목적</th>
              <th className="px-3 py-2.5 font-medium">프로젝트 코드</th>
              <th className="px-3 py-2.5 font-medium">프로젝트명</th>
              <th className="px-3 py-2.5 font-medium">메뉴</th>
              <th className="px-3 py-2.5 font-medium">버튼</th>
              <th className="px-3 py-2.5 font-medium">사용 시간</th>
              <th className="px-3 py-2.5 font-medium">별점</th>
              <th className="px-3 py-2.5 font-medium">에러 로그</th>
              <th className="px-3 py-2.5 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center"
              >
                <td className="px-3 py-2.5 text-gray-400 font-mono">{log.userKey}</td>
                <td className="px-3 py-2.5 font-medium text-gray-900">{log.userName}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.departmentName}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.positionName}</td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{log.occurredAt}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.toolType === "INTERNAL" ? "내부" : "외부"}</td>
                <td className="px-3 py-2.5 text-gray-700">{log.toolName}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.purpose}</td>
                <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{log.fpProjectCode}</td>
                <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate">{log.fpProjectName}</td>
                <td className="px-3 py-2.5 text-gray-500">{log.menuName}</td>
                <td className="px-3 py-2.5 text-gray-500">{log.buttonName}</td>
                <td className="px-3 py-2.5 text-gray-500 font-mono">{formatDuration(log.durationMs)}</td>
                <td className="px-3 py-2.5 text-gray-500">{log.rating != null ? `${log.rating}점` : "-"}</td>
                <td className="px-3 py-2.5">
                  {log.errorCode ? (
                    <span className="text-red-600 text-[10px]">{log.errorCode}</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">{log.clientIp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-4 gap-1">
        <button className="w-7 h-7 rounded text-xs bg-gray-100 text-gray-400 border border-gray-200">‹</button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-7 h-7 rounded text-xs ${
              page === 1 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}
        <button className="w-7 h-7 rounded text-xs bg-gray-100 text-gray-400 border border-gray-200">›</button>
      </div>
    </div>
  );
}
