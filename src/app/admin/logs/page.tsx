"use client";

import { useState } from "react";

const MOCK_LOGS = [
  { id: 1, userNo: "U001", user: "김철수", dept: "ICT사업부", position: "과장", action: "로그인", page: "메인", ip: "192.168.1.10", time: "2026-04-10 09:15:23" },
  { id: 2, userNo: "U002", user: "이영희", dept: "엔지니어링", position: "대리", action: "프로젝트 등록", page: "Ongoing PRJ", ip: "192.168.1.22", time: "2026-04-10 09:22:41" },
  { id: 3, userNo: "U003", user: "박민수", dept: "ICT사업부", position: "차장", action: "파일 다운로드", page: "자료실", ip: "192.168.1.15", time: "2026-04-10 09:30:05" },
  { id: 4, userNo: "U004", user: "정수연", dept: "경영지원", position: "사원", action: "제안서 제출", page: "프로젝트 실적", ip: "192.168.1.33", time: "2026-04-10 09:45:12" },
  { id: 5, userNo: "U005", user: "최진욱", dept: "ICT사업부", position: "과장", action: "메일 발송", page: "관리자", ip: "192.168.1.5", time: "2026-04-10 10:02:30" },
  { id: 6, userNo: "U006", user: "홍길동", dept: "컨설팅", position: "팀장", action: "로그인", page: "메인", ip: "10.61.24.50", time: "2026-04-10 10:15:00" },
  { id: 7, userNo: "U007", user: "강미나", dept: "스마트관광", position: "대리", action: "수행내역서 제출", page: "프로젝트 실적", ip: "192.168.1.44", time: "2026-04-10 10:30:18" },
  { id: 8, userNo: "U001", user: "김철수", dept: "ICT사업부", position: "과장", action: "AI Gate 접속", page: "AI 게이트", ip: "192.168.1.10", time: "2026-04-10 10:45:55" },
];

export default function LogsPage() {
  const [dateFrom, setDateFrom] = useState("2026-04-03");
  const [dateTo, setDateTo] = useState("2026-04-10");
  const [userName, setUserName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const filteredLogs = MOCK_LOGS.filter(
    (log) =>
      (!userName || log.user.includes(userName)) &&
      (!deptName || log.dept.includes(deptName))
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">MICE DX 사용로그</h2>
        <p className="text-xs text-gray-500 mt-1">MICE DX 사용자 접속 및 활동 이력을 확인하는 화면입니다.</p>
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
            <label className="block text-[11px] font-medium text-gray-600 mb-1">사용자명</label>
            <input type="text" placeholder="홍길동" value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-32 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">부서명</label>
            <input type="text" placeholder="ICT사업부" value={deptName}
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
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
              <th className="px-3 py-2.5 font-medium">UserNo</th>
              <th className="px-3 py-2.5 font-medium">사용자</th>
              <th className="px-3 py-2.5 font-medium">부서</th>
              <th className="px-3 py-2.5 font-medium">직급</th>
              <th className="px-3 py-2.5 font-medium">접속 일시</th>
              <th className="px-3 py-2.5 font-medium">활동</th>
              <th className="px-3 py-2.5 font-medium">페이지</th>
              <th className="px-3 py-2.5 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center"
              >
                <td className="px-3 py-2.5 text-gray-400 font-mono">{log.userNo}</td>
                <td className="px-3 py-2.5 font-medium text-gray-900">{log.user}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.dept}</td>
                <td className="px-3 py-2.5 text-gray-600">{log.position}</td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{log.time}</td>
                <td className="px-3 py-2.5 text-gray-700">{log.action}</td>
                <td className="px-3 py-2.5 text-gray-500">{log.page}</td>
                <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">{log.ip}</td>
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
