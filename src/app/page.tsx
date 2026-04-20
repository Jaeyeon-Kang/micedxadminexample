"use client";

const STATS = [
  { label: "오늘 접속자", value: "128", change: "+12%", positive: true },
  { label: "이번 주 접속자", value: "854", change: "+5%", positive: true },
  { label: "AI Gate 사용량", value: "342건", change: "+28%", positive: true },
  { label: "발송 메일", value: "47건", change: "-3%", positive: false },
];

const RECENT_LOGS = [
  { user: "김철수", dept: "ICT사업부", action: "프리패스 정산서 진입", target: "2026-ICT-001", time: "10분 전" },
  { user: "이영희", dept: "엔지니어링", action: "정산서 AI 검토", target: "2026-ENG-042", time: "25분 전" },
  { user: "박민수", dept: "ICT사업부", action: "AI 서비스 검색", target: "-", time: "40분 전" },
  { user: "정수연", dept: "경영지원", action: "정산서 생성", target: "2026-BIZ-018", time: "1시간 전" },
  { user: "최진욱", dept: "ICT사업부", action: "프로젝트 종료", target: "2025-ICT-099", time: "2시간 전" },
  { user: "홍길동", dept: "컨설팅", action: "최신 AI 트렌드 확인", target: "-", time: "3시간 전" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold">대시보드</h2>
        <p className="text-xs text-gray-500 mt-1">MICE DX 주요 지표를 한 눈에 확인하는 화면입니다.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <p className="text-[11px] text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-[11px] mt-1 ${stat.positive ? "text-green-600" : "text-red-500"}`}>{stat.change} vs 지난주</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-[13px] font-semibold text-gray-900">최근 활동</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 text-center">
              <th className="px-5 py-2.5 font-medium">사용자</th>
              <th className="px-5 py-2.5 font-medium">부서</th>
              <th className="px-5 py-2.5 font-medium">활동</th>
              <th className="px-5 py-2.5 font-medium">프로젝트</th>
              <th className="px-5 py-2.5 font-medium">시간</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_LOGS.map((log, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center"
              >
                <td className="px-5 py-2.5 font-medium text-gray-900">{log.user}</td>
                <td className="px-5 py-2.5 text-gray-600">{log.dept}</td>
                <td className="px-5 py-2.5 text-gray-700">{log.action}</td>
                <td className="px-5 py-2.5 text-gray-400 font-mono text-[11px]">{log.target}</td>
                <td className="px-5 py-2.5 text-gray-400">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
