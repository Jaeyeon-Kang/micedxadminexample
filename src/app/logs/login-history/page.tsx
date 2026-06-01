"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from "@/config";
import { exportToExcel, fetchAllPages } from "@/lib/excel-export";
import { Pagination } from "@/components/Pagination";

type LoginLog = {
  rowNum: number;
  userNo: string;
  userNm: string;
  departmentNm: string;
  positionNm: string;
  jobNm: string;
  ipAddress: string;
  userAgent: string;
  deviceGbn: string;
  osNm: string;
  browserNm: string;
  createdDt: string;
};

function formatDate(iso: string) {
  if (!iso) return "-";
  return iso.replace("T", " ").slice(0, 19);
}

type LoginLogFilters = { dateFrom: string; dateTo: string; keyword: string };

async function searchLoginLogs(
  page: number,
  size: number,
  filters: LoginLogFilters,
): Promise<{ items: LoginLog[]; totalCount: number }> {
  const res = await fetch(`${API_BASE}/api/v1/admin/login-history/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page,
      size,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return {
    items: (json.data?.list ?? []) as LoginLog[],
    totalCount: json.data?.totalCount ?? 0,
  };
}

export default function LoginHistoryPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);

  const [appliedDateFrom, setAppliedDateFrom] = useState(monthAgo);
  const [appliedDateTo, setAppliedDateTo] = useState(today);
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [data, setData] = useState<LoginLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchLoginLogs(page, pageSize, {
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      keyword: appliedKeyword,
    })
      .then(({ items, totalCount }) => {
        setData(items);
        setTotalCount(totalCount);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [page, pageSize, appliedDateFrom, appliedDateTo, appliedKeyword]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleSearch = () => {
    setPage(0);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedKeyword(keyword);
  };

  const handleReset = () => {
    setDateFrom(monthAgo);
    setDateTo(today);
    setKeyword("");
    setPage(0);
    setAppliedDateFrom(monthAgo);
    setAppliedDateTo(today);
    setAppliedKeyword("");
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const handleExcelDownload = async () => {
    try {
      const all = await fetchAllPages((p, s) =>
        searchLoginLogs(p, s, {
          dateFrom: appliedDateFrom,
          dateTo: appliedDateTo,
          keyword: appliedKeyword,
        }),
      );
      exportToExcel(all, {
        filenamePrefix: "로그인 사용 로그",
        headers: [
          "NO", "UserNo", "이름", "부서", "직급", "직책",
          "IP", "User Agent", "디바이스", "OS", "브라우저", "일시",
        ],
        mapRow: (r) => [
          r.rowNum, r.userNo, r.userNm, r.departmentNm, r.positionNm, r.jobNm,
          r.ipAddress, r.userAgent, r.deviceGbn, r.osNm, r.browserNm, formatDate(r.createdDt),
        ],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "다운로드 실패");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-5 shrink-0">
        <h2 className="text-lg font-bold">로그인</h2>
        <p className="text-xs text-gray-500 mt-1">
          데이터허브 사용자 로그인 이력을 조회하는 화면입니다.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 shadow-sm shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">로그인 시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">검색어</label>
            <input
              type="text"
              placeholder="사용자 이름·부서"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-60 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-black transition-colors h-[34px] disabled:opacity-50"
            >
              조회
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-white text-gray-600 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors border border-gray-300 h-[34px] disabled:opacity-50"
            >
              초기화
            </button>
          </div>
          <button
            onClick={handleExcelDownload}
            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded text-sm hover:bg-emerald-100 transition-colors h-[34px] ml-auto"
          >
            로그 다운로드
          </button>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          * 검색은 AND 연산이며 일부만 입력해도 조회 가능합니다.
        </p>
      </div>

      {/* Result Info */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-xs text-gray-500">
          총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>건
        </p>
        <select
          value={pageSize}
          onChange={(e) => handlePageSize(Number(e.target.value))}
          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600"
        >
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
          <option value={100}>100개씩</option>
        </select>
      </div>

      {error && (
        <div className="mb-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-600 shrink-0">
          불러오기 실패: {error}
        </div>
      )}

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm flex-1 min-h-0">
        <table className="w-full min-w-[1500px]">
          <thead className="sticky top-0 z-10">
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
              <th className="px-3 py-2.5 font-medium">NO</th>
              <th className="px-3 py-2.5 font-medium">UserNo</th>
              <th className="px-3 py-2.5 font-medium">이름</th>
              <th className="px-3 py-2.5 font-medium">부서</th>
              <th className="px-3 py-2.5 font-medium">직급</th>
              <th className="px-3 py-2.5 font-medium">직책</th>
              <th className="px-3 py-2.5 font-medium">IP</th>
              <th className="px-3 py-2.5 font-medium text-left">User Agent</th>
              <th className="px-3 py-2.5 font-medium">디바이스</th>
              <th className="px-3 py-2.5 font-medium">OS</th>
              <th className="px-3 py-2.5 font-medium">브라우저</th>
              <th className="px-3 py-2.5 font-medium">일시</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 && !error ? (
              <tr>
                <td colSpan={12} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr
                  key={r.rowNum}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center"
                >
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{r.rowNum}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{r.userNo}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{r.userNm}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.departmentNm}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.positionNm}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.jobNm}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">{r.ipAddress}</td>
                  <td
                    className="px-3 py-2.5 text-gray-400 text-left font-mono text-[10px] max-w-[260px] truncate"
                    title={r.userAgent}
                  >
                    {r.userAgent}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{r.deviceGbn}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.osNm}</td>
                  <td className="px-3 py-2.5 text-gray-600">{r.browserNm}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDate(r.createdDt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
