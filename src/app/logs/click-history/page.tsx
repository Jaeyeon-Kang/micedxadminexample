"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from "@/config";
import { exportToExcel, fetchAllPages } from "@/lib/excel-export";
import { Pagination } from "@/components/Pagination";

type StatType = "list" | "daily" | "button" | "userButton" | "user" | "userDaily";
type PageCategory = "all" | "main";

const STAT_OPTIONS: { value: StatType; label: string; endpoint: string }[] = [
  { value: "list",       label: "목록",             endpoint: "list/search" },
  { value: "daily",      label: "날짜별 통계",       endpoint: "date-stat/search" },
  { value: "button",     label: "버튼별 통계",       endpoint: "button-stat/search" },
  { value: "userButton", label: "사용자/버튼별 통계", endpoint: "user-button-stat/search" },
  { value: "user",       label: "사용자별 통계",      endpoint: "user-stat/search" },
  { value: "userDaily",  label: "사용자/날짜별 통계", endpoint: "user-date-stat/search" },
];

type Row = Record<string, unknown>;

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "-";
  return String(iso).replace("T", " ").slice(0, 19);
}


async function searchClickLog(
  endpoint: string,
  page: number,
  size: number,
  dateFrom: string,
  dateTo: string,
  pageCategory: PageCategory,
  keyword: string,
): Promise<{ items: Row[]; totalCount: number }> {
  const res = await fetch(`${API_BASE}/api/v1/admin/click-log/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page,
      size,
      dateFrom,
      dateTo,
      ...(pageCategory === "main" ? { pageGbnCd: "CGC013" } : {}),
      ...(keyword ? { keyword } : {}),
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result === "FAIL") throw new Error(json.message ?? "조회 실패");
  return {
    items: (json.data?.list ?? []) as Row[],
    totalCount: json.data?.totalCount ?? 0,
  };
}

const str = (v: unknown) => (v == null ? "-" : String(v));
const num = (v: unknown) => (v == null ? "-" : Number(v).toLocaleString());

export default function ClickHistoryPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [statType, setStatType] = useState<StatType>("list");
  const [dateFrom, setDateFrom] = useState(monthAgo);
  const [dateTo, setDateTo] = useState(today);
  const [pageCategory, setPageCategory] = useState<PageCategory>("all");
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);

  const [appliedDateFrom, setAppliedDateFrom] = useState(monthAgo);
  const [appliedDateTo, setAppliedDateTo] = useState(today);
  const [appliedPageCategory, setAppliedPageCategory] = useState<PageCategory>("all");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [data, setData] = useState<Row[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = STAT_OPTIONS.find((o) => o.value === statType)!.endpoint;

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchClickLog(endpoint, page, pageSize, appliedDateFrom, appliedDateTo, appliedPageCategory, appliedKeyword)
      .then(({ items, totalCount }) => {
        setData(items);
        setTotalCount(totalCount);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [endpoint, page, pageSize, appliedDateFrom, appliedDateTo, appliedPageCategory, appliedKeyword]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleStatType = (t: StatType) => {
    setStatType(t);
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedPageCategory(pageCategory);
    setAppliedKeyword(keyword);
  };

  const handleReset = () => {
    setDateFrom(monthAgo);
    setDateTo(today);
    setPageCategory("all");
    setKeyword("");
    setPage(0);
    setAppliedDateFrom(monthAgo);
    setAppliedDateTo(today);
    setAppliedPageCategory("all");
    setAppliedKeyword("");
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const currentLabel = STAT_OPTIONS.find((o) => o.value === statType)?.label ?? "";

  const handleExcelDownload = async () => {
    try {
      const prefix = `버튼 클릭 히스토리_${currentLabel}`;
      const fetcher = (p: number, s: number) =>
        searchClickLog(endpoint, p, s, appliedDateFrom, appliedDateTo, appliedPageCategory, appliedKeyword);

      if (statType === "list") {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "UserNo", "이름", "부서", "직급", "직책", "일시", "페이지", "버튼명", "URL"],
          mapRow: (r) => [
            num(r.rowNum), num(r.userNo), str(r.userNm), str(r.departmentNm), str(r.positionNm), str(r.jobNm),
            formatDateTime(r.clickDt as string), str(r.pageNm), str(r.buttonNm), str(r.url),
          ],
        });
      } else if (statType === "daily") {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "날짜", "페이지", "버튼명", "URL", "총 클릭수"],
          mapRow: (r) => [num(r.rowNum), str(r.clickDate), str(r.pageNm), str(r.buttonNm), str(r.url), num(r.totalClicks)],
        });
      } else if (statType === "button") {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "페이지", "버튼명", "URL", "총 클릭수"],
          mapRow: (r) => [num(r.rowNum), str(r.pageNm), str(r.buttonNm), str(r.url), num(r.totalClicks)],
        });
      } else if (statType === "userButton") {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "UserNo", "이름", "부서", "직급", "직책", "페이지", "버튼명", "URL", "총 클릭수"],
          mapRow: (r) => [
            num(r.rowNum), num(r.userNo), str(r.userNm), str(r.departmentNm), str(r.positionNm), str(r.jobNm),
            str(r.pageNm), str(r.buttonNm), str(r.url), num(r.totalClicks),
          ],
        });
      } else if (statType === "user") {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "UserNo", "이름", "부서", "직급", "직책", "총 클릭수"],
          mapRow: (r) => [num(r.rowNum), num(r.userNo), str(r.userNm), str(r.departmentNm), str(r.positionNm), str(r.jobNm), num(r.totalClicks)],
        });
      } else {
        const all = await fetchAllPages(fetcher);
        exportToExcel(all, {
          filenamePrefix: prefix,
          headers: ["NO", "UserNo", "이름", "부서", "직급", "직책", "날짜", "총 클릭수"],
          mapRow: (r) => [num(r.rowNum), num(r.userNo), str(r.userNm), str(r.departmentNm), str(r.positionNm), str(r.jobNm), str(r.clickDate), num(r.totalClicks)],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "다운로드 실패");
    }
  };

  const emptyColspan =
    statType === "list" ? 10
    : statType === "daily" ? 6
    : statType === "button" ? 5
    : statType === "userButton" ? 10
    : statType === "user" ? 7
    : 8;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-5 shrink-0">
        <h2 className="text-lg font-bold">버튼 클릭 히스토리</h2>
        <p className="text-xs text-gray-500 mt-1">
          데이터허브 주요 버튼 클릭 이력을 통계 유형별로 조회하는 화면입니다.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 shadow-sm shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">통계 유형</label>
            <select
              value={statType}
              onChange={(e) => handleStatType(e.target.value as StatType)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 w-44"
            >
              {STAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">시작일</label>
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
            <label className="block text-[11px] font-medium text-gray-600 mb-1">페이지 분류</label>
            <select
              value={pageCategory}
              onChange={(e) => setPageCategory(e.target.value as PageCategory)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 w-36"
            >
              <option value="all">전체 영역</option>
              <option value="main">메인 페이지</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">검색어</label>
            <input
              type="text"
              placeholder="버튼명·이름·부서"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-52 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-black transition-colors h-[34px] disabled:opacity-50"
            >
              검색
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
      </div>

      {/* Result Info */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <p className="text-xs text-gray-500">
          총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>건
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-700">{currentLabel}</span>
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
          오류: {error}
        </div>
      )}

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm flex-1 min-h-0">

        {/* 목록 */}
        {statType === "list" && (
          <table className="w-full min-w-[1400px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">UserNo</th>
                <th className="px-3 py-2.5 font-medium">이름</th>
                <th className="px-3 py-2.5 font-medium">부서</th>
                <th className="px-3 py-2.5 font-medium">직급</th>
                <th className="px-3 py-2.5 font-medium">직책</th>
                <th className="px-3 py-2.5 font-medium">일시</th>
                <th className="px-3 py-2.5 font-medium">페이지</th>
                <th className="px-3 py-2.5 font-medium">버튼명</th>
                <th className="px-3 py-2.5 font-medium text-left">URL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.userNo)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.userNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.departmentNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.positionNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{str(r.jobNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{formatDateTime(r.clickDt as string)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{str(r.pageNm)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.buttonNm)}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-left font-mono text-[10px] max-w-[240px] truncate" title={str(r.url)}>{str(r.url)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 날짜별 통계 */}
        {statType === "daily" && (
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">날짜</th>
                <th className="px-3 py-2.5 font-medium">페이지</th>
                <th className="px-3 py-2.5 font-medium">버튼명</th>
                <th className="px-3 py-2.5 font-medium text-left">URL</th>
                <th className="px-3 py-2.5 font-medium">총 클릭수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{str(r.clickDate)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{str(r.pageNm)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.buttonNm)}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-left font-mono text-[10px] max-w-[240px] truncate" title={str(r.url)}>{str(r.url)}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600 font-mono">{num(r.totalClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 버튼별 통계 */}
        {statType === "button" && (
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">페이지</th>
                <th className="px-3 py-2.5 font-medium">버튼명</th>
                <th className="px-3 py-2.5 font-medium text-left">URL</th>
                <th className="px-3 py-2.5 font-medium">총 클릭수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{str(r.pageNm)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.buttonNm)}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-left font-mono text-[10px] max-w-[280px] truncate" title={str(r.url)}>{str(r.url)}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600 font-mono">{num(r.totalClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 사용자/버튼별 통계 */}
        {statType === "userButton" && (
          <table className="w-full min-w-[1300px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">UserNo</th>
                <th className="px-3 py-2.5 font-medium">이름</th>
                <th className="px-3 py-2.5 font-medium">부서</th>
                <th className="px-3 py-2.5 font-medium">직급</th>
                <th className="px-3 py-2.5 font-medium">직책</th>
                <th className="px-3 py-2.5 font-medium">페이지</th>
                <th className="px-3 py-2.5 font-medium">버튼명</th>
                <th className="px-3 py-2.5 font-medium text-left">URL</th>
                <th className="px-3 py-2.5 font-medium">총 클릭수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.userNo)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.userNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.departmentNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.positionNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{str(r.jobNm)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{str(r.pageNm)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.buttonNm)}</td>
                  <td className="px-3 py-2.5 text-gray-400 text-left font-mono text-[10px] max-w-[220px] truncate" title={str(r.url)}>{str(r.url)}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600 font-mono">{num(r.totalClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 사용자별 통계 */}
        {statType === "user" && (
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">UserNo</th>
                <th className="px-3 py-2.5 font-medium">이름</th>
                <th className="px-3 py-2.5 font-medium">부서</th>
                <th className="px-3 py-2.5 font-medium">직급</th>
                <th className="px-3 py-2.5 font-medium">직책</th>
                <th className="px-3 py-2.5 font-medium">총 클릭수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.userNo)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.userNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.departmentNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.positionNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{str(r.jobNm)}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600 font-mono">{num(r.totalClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 사용자/날짜별 통계 */}
        {statType === "userDaily" && (
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
                <th className="px-3 py-2.5 font-medium">NO</th>
                <th className="px-3 py-2.5 font-medium">UserNo</th>
                <th className="px-3 py-2.5 font-medium">이름</th>
                <th className="px-3 py-2.5 font-medium">부서</th>
                <th className="px-3 py-2.5 font-medium">직급</th>
                <th className="px-3 py-2.5 font-medium">직책</th>
                <th className="px-3 py-2.5 font-medium">날짜</th>
                <th className="px-3 py-2.5 font-medium">총 클릭수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-gray-400">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-gray-400">데이터가 없습니다.</td></tr>
              ) : data.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.rowNum)}</td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{str(r.userNo)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{str(r.userNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.departmentNm)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{str(r.positionNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{str(r.jobNm)}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{str(r.clickDate)}</td>
                  <td className="px-3 py-2.5 font-semibold text-orange-600 font-mono">{num(r.totalClicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
