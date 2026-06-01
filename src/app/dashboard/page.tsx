"use client";

export default function DashboardPage() {
  return (
    <div className="-m-6 h-[calc(100vh-3rem)] flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          데이터 대시보드
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          실제 환경에서는 Streamlit 기반 데이터 대시보드가
          이 영역에 iframe으로 임베딩됩니다.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          <span>Streamlit</span>
          <span>·</span>
          <span>Python</span>
          <span>·</span>
          <span>실시간 시각화</span>
        </div>
      </div>
    </div>
  );
}
