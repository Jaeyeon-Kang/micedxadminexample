"use client";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">시스템 설정</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">일반 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">사이트 이름</label>
              <input
                type="text"
                defaultValue="EZ 데이터허브"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">사이트 URL</label>
              <input
                type="text"
                defaultValue="https://micedx.ezpmp.co.kr"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">AI Gate URL</label>
              <input
                type="text"
                defaultValue="https://aigate.ezpmp.co.kr"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* SSO / Auth */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">인증 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">이메일 도메인</label>
              <input
                type="text"
                defaultValue="@ezpmp.co.kr"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">세션 타임아웃 (분)</label>
              <input
                type="number"
                defaultValue={30}
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">SSO 연동 (AI Gate)</label>
              <div className="w-12 h-6 rounded-full bg-orange-500 relative cursor-pointer">
                <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">API 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">API Base URL</label>
              <input
                type="text"
                defaultValue="https://micedx-api.ezpmp.co.kr"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">파일 업로드 경로</label>
              <input
                type="text"
                defaultValue="/data/micedx/"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">최대 업로드 크기</label>
              <input
                type="text"
                defaultValue="2GB"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Redis / Cache */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">캐시 / Redis</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Redis 활성화</label>
              <div className="w-12 h-6 rounded-full bg-orange-500 relative cursor-pointer">
                <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Redis Host</label>
              <input
                type="text"
                defaultValue="10.61.24.107"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Redis Port</label>
              <input
                type="text"
                defaultValue="6379"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="bg-orange-500 text-white px-6 py-2 rounded text-sm hover:bg-orange-600 transition-colors">
          전체 설정 저장
        </button>
      </div>
    </div>
  );
}
