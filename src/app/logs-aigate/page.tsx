"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportToExcel, fetchAllPages } from "@/lib/excel-export";
import { Pagination } from "@/components/Pagination";

type LogItem = {
  logId: number;
  serviceCd?: string;
  service?: string;
  occurredAt?: string | null;
  durationMs?: number | null;
  toolName?: string;
  toolType?: string;
  purpose?: string | string[];
  purposes?: string[];
  fpProjectCode?: string | null;
  fpProjectName?: string | null;
  menuName?: string;
  buttonName?: string;
  result?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  rating?: number | null;
  userKey?: string;
  userName?: string;
  departmentName?: string;
  positionName?: string;
  projectCd?: string;
  siteId?: number;
  role?: string;
  clientIp?: string;
};

type Filters = {
  dateFrom: string;
  dateTo: string;
  toolName: string;
  userName: string;
  departmentName: string;
  page: number;
  size: number;
};

// EZ AI Tool 다중 행을 사용 목적 단일 행으로 묶을 때만 쓰는 식별자 (serviceCd 기준 그대로)
const SERVICE_CD_EZ_AI_MASTERY = "EZ_AI_MASTERY";

type PartnerOption = {
  id: number;
  name: string;
  sortOrder: number;
};

const PURPOSE_LABELS: Record<string, string> = {
  SETTLEMENT_OVERVIEW: "정산 현황 확인",
  SETTLEMENT_LIST_VIEW: "정산서 목록 확인",
  SETTLEMENT_DETAIL_VIEW: "정산서 상세 확인",
  SETTLEMENT_CHECK: "정산서 검토",
  SETTLEMENT_SUBMIT: "정산서 제출",
  AI_REVIEW: "AI 검토",
  USER_FEEDBACK: "별점 등록",
  FP_HOME_ENTRY: "프리패스 정산서 진입",
  FP_PROJECT_CREATE: "새 프로젝트 등록",
  FP_PROJECT_ENTRY: "프로젝트 진입",
  FP_RECEIPT_MANAGE: "영수증 관리",
  FP_CARD_MANAGE: "법인카드 내역 관리",
  FP_SETTLEMENT_CREATE: "정산서 생성",
  FP_SETTLEMENT_AI_REVIEW: "정산서 AI 검토",
  FP_SETTLEMENT_DOWNLOAD: "정산서 다운로드",
  FP_SETTLEMENT_DELETE: "정산서 삭제",
  FP_QUOTE_MANAGE: "견적서 관리",
  FP_QUOTE_EXPORT: "견적서 총괄표 다운로드",
  FP_PROJECT_CLOSE: "프로젝트 종료",
  FP_PROJECT_DELETE: "프로젝트 삭제",
  AI_SERVICE_SEARCH: "AI 서비스 검색",
  AI_USAGE_TIP: "AI 활용 Tip 확인",
  LATEST_AI_TREND: "최신 AI 트렌드 확인",
};

const TOOL_NAME_LABELS: Record<string, string> = {
  FREEPASS_SETTLEMENT: "프리패스 정산서",
  FREEPASS_RATING: "프리패스 별점",
  EZ_AI_TOOL_MASTERY: "EZ人의 AI 도구 완전 정복",
};

const MENU_NAME_LABELS: Record<string, string> = {
  NONE: "-",
  FREEPASS: "프리패스",
  HOME: "HOME",
  PROJECT_DASHBOARD: "대시보드",
  ADVANCE_RECEIPT: "전도금 영수증",
  CORPORATE_CARD: "법인카드 내역",
  SETTLEMENT_LIST: "정산서 목록",
  QUOTE_MANAGEMENT: "견적서 관리",
  PROJECT_INFO: "프로젝트 정보",
};

const BUTTON_NAME_LABELS: Record<string, string> = {
  NONE: "-",
  RATING_REGISTER: "별점 등록",
  CREATE_PROJECT: "새 프로젝트",
  CREATE_SETTLEMENT: "새 정산서",
  AI_REVIEW_REQUEST: "AI 검토 요청",
  AI_REVIEW_RETRY: "AI 재검토",
  EXPORT_EXCEL: "Excel 다운로드",
  DELETE_SETTLEMENT: "정산서 삭제",
  EXPORT_QUOTE_SUMMARY: "견적 총괄표 다운로드",
  CLOSE_PROJECT: "프로젝트 종료",
  DELETE_PROJECT: "프로젝트 삭제",
};

const ERROR_CODE_LABELS: Record<string, string> = {
  FREEPASS_ACCESS_DENIED: "프리패스 접근 권한 없음",
  FREEPASS_LOG_SAVE_FAILED: "로그 저장 실패",
  FREEPASS_LOG_UNAUTHORIZED: "로그 적재 세션 없음",
  FREEPASS_RATING_SAVE_FAILED: "별점 저장 실패",
  FREEPASS_RATING_UNAUTHORIZED: "별점 조회/등록 세션 없음",
  FREEPASS_TOKEN_ALREADY_USED: "이미 사용된 토큰",
  INVALID_FREEPASS_LOG_FILTER: "로그 조회 조건 오류",
  INVALID_FREEPASS_LOG_REQUEST: "로그 요청값 오류",
  INVALID_FREEPASS_RATING_REQUEST: "별점 요청값 오류",
  INVALID_FREEPASS_TOKEN: "유효하지 않거나 만료된 토큰",
  INVALID_EZ_AI_TOOL_LOG_REQUEST: "EZ AI 도구 로그 요청값 오류",
  INVALID_EZ_AI_TOOL_PURPOSE: "EZ AI 도구 purpose 오류",
  EZ_AI_TOOL_LOG_UNAUTHORIZED: "EZ AI 도구 로그 세션 없음",
  EZ_AI_TOOL_LOG_SAVE_FAILED: "EZ AI 도구 로그 저장 실패",
};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getDefaultFilters(): Filters {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  return {
    dateFrom: formatDate(weekAgo),
    dateTo: formatDate(today),
    toolName: "",
    userName: "",
    departmentName: "",
    page: 0,
    size: 20,
  };
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  (Object.entries(filters) as [keyof Filters, string | number][]).forEach(([k, v]) => {
    if (v === "" || v == null) return;
    params.set(k, String(v));
  });
  return params.toString();
}

function getOccurredAtParts(value?: string | null) {
  if (!value) return { date: "-", time: "" };
  const formatted = new Date(value).toLocaleString("ko-KR");
  const parts = formatted.split(" ");
  if (parts.length < 2) return { date: formatted, time: "" };
  return { date: parts.slice(0, 3).join(" "), time: parts.slice(3).join(" ") };
}

function formatOccurredAtForExport(value?: string | null) {
  const { date, time } = getOccurredAtParts(value);
  if (date === "-" && !time) return "-";
  return time ? `${date} ${time}` : date;
}

function formatDurationLabel(value?: number | null) {
  if (value == null) return "-";
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const totalSec = ms === 0 ? 0 : Math.max(1, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}초`;
  if (s === 0) return `${m}분`;
  return `${m}분 ${s}초`;
}

function formatToolType(v?: string) {
  if (v === "INTERNAL") return "내부";
  if (v === "EXTERNAL") return "외부";
  return v || "-";
}

function formatToolName(v?: string) {
  if (!v) return "-";
  return TOOL_NAME_LABELS[v] || v;
}

function formatMenuName(v?: string) {
  return (v && MENU_NAME_LABELS[v]) || v || "-";
}

function formatButtonName(v?: string) {
  return (v && BUTTON_NAME_LABELS[v]) || v || "-";
}

function formatErrorLogValue(v?: string | null) {
  if (!v) return "-";
  const label = ERROR_CODE_LABELS[v];
  return label ? `${label} (${v})` : v;
}

function formatErrorLogDisplayValue(v?: string | null) {
  if (!v) return "-";
  return ERROR_CODE_LABELS[v] || v;
}

function normalizePurposeValues(value?: string | string[], purposes?: string[]): string[] {
  if (Array.isArray(purposes) && purposes.length > 0) {
    return purposes.map((i) => String(i).trim()).filter(Boolean);
  }
  if (!value) return [];
  if (Array.isArray(value)) return value.map((i) => String(i).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((i: unknown) => String(i).trim()).filter(Boolean);
      } catch {
        // fallthrough
      }
    }
    if (trimmed.includes(",")) return trimmed.split(",").map((i) => i.trim()).filter(Boolean);
    return [trimmed];
  }
  return [];
}

function aggregateEzAiRows(items: LogItem[]): LogItem[] {
  const grouped = new Map<string, LogItem>();
  items.forEach((item) => {
    // 레거시 EZ AI Tool 로그가 다중 row 로 적재된 경우 사용 목적을 단일 row 로 병합.
    // 마이그레이션 이후엔 단일 row 로 들어오지만 기존 데이터 호환을 위해 유지.
    const isEzAi =
      item.serviceCd === SERVICE_CD_EZ_AI_MASTERY ||
      item.service === SERVICE_CD_EZ_AI_MASTERY;

    if (!isEzAi) {
      grouped.set(`raw:${item.logId}`, item);
      return;
    }

    const key = [
      item.serviceCd || item.service || "",
      item.userKey || "",
      item.userName || "",
      item.departmentName || "",
      item.positionName || "",
      item.occurredAt || "",
      item.toolName || "",
      item.clientIp || "",
    ].join("|");

    const purposeValues = normalizePurposeValues(item.purpose as string, item.purposes);

    if (!grouped.has(key)) {
      grouped.set(key, { ...item, purposes: purposeValues });
      return;
    }
    const current = grouped.get(key)!;
    const merged = Array.from(new Set([...(current.purposes || []), ...purposeValues]));
    grouped.set(key, { ...current, purposes: merged });
  });
  return Array.from(grouped.values());
}

// filterValue 는 파트너의 name (예: "프리패스 정산서") 또는 ""(전체).
// 백엔드 마이그레이션 이후 모든 로그의 toolName 이 partner.name 과 동일하다고 가정.
function matchesPartnerFilter(item: LogItem, filterValue: string) {
  if (!filterValue) return true;
  return item.toolName === filterValue;
}

function formatPurposeList(value?: string | string[], purposes?: string[]): string[] | "-" {
  const values = normalizePurposeValues(value, purposes);
  if (!values.length) return "-";
  return values.map((v) => PURPOSE_LABELS[v] || v);
}

function formatPurposeForExport(value?: string | string[], purposes?: string[]) {
  const res = formatPurposeList(value, purposes);
  return res === "-" ? "-" : res.join("\n");
}

const EXPORT_HEADERS = [
  "UserNo", "사용자", "팀", "직급", "접속 일시", "유형", "AI 업무 파트너 명",
  "사용 목적", "프로젝트 코드", "프로젝트명", "메뉴", "버튼", "사용 시간",
  "별점", "에러 로그", "IP",
];

function mapExportRow(item: LogItem) {
  return [
    item.userKey || "-",
    item.userName || "-",
    item.departmentName || "-",
    item.positionName || "-",
    formatOccurredAtForExport(item.occurredAt),
    formatToolType(item.toolType),
    formatToolName(item.toolName),
    formatPurposeForExport(item.purpose as string, item.purposes),
    item.fpProjectCode || "-",
    item.fpProjectName || "-",
    formatMenuName(item.menuName),
    formatButtonName(item.buttonName),
    formatDurationLabel(item.durationMs),
    item.rating != null ? `${item.rating}점` : "-",
    formatErrorLogValue(item.errorCode || item.errorMessage),
    item.clientIp || "-",
  ];
}

type ApiResponse = {
  result: "SUCCESS" | "FAIL" | string;
  data?: { list?: LogItem[]; totalCount?: number; page?: number; size?: number } | null;
  message?: string;
  errorCode?: string | null;
};

type LogQueryFilters = Omit<Filters, "page" | "size">;

async function searchLogs(
  page: number,
  size: number,
  filters: LogQueryFilters,
): Promise<{ items: LogItem[]; totalCount: number }> {
  // 백엔드 toolName 쿼리 파라미터가 LIKE 검색을 지원하므로 partner.name 그대로 전달.
  const url = `/api/aigate/admin/logs/events?${buildQuery({ ...filters, page, size })}`;
  const res = await fetch(url, { method: "GET", credentials: "include", cache: "no-store" });
  const payload: ApiResponse = await res.json();
  if (payload?.result !== "SUCCESS") {
    throw new Error(payload?.message || payload?.errorCode || "로그 조회 실패");
  }
  return {
    items: payload?.data?.list ?? [],
    totalCount: payload?.data?.totalCount ?? 0,
  };
}

function downloadLogsAsExcel(items: LogItem[]) {
  exportToExcel(items, {
    filenamePrefix: "AI 게이트 사용 로그",
    headers: EXPORT_HEADERS,
    mapRow: mapExportRow,
    columnWidths: [10, 12, 14, 10, 22, 8, 20, 20, 14, 24, 18, 20, 10, 8, 18, 16],
  });
}

function OccurredAtCell({ value }: { value?: string | null }) {
  const { date, time } = getOccurredAtParts(value);
  if (date === "-" && !time) return <>-</>;
  return (
    <div className="leading-5">
      <div>{date}</div>
      {time ? <div>{time}</div> : null}
    </div>
  );
}

function PurposeCell({ value, values }: { value?: string | string[]; values?: string[] }) {
  const result = formatPurposeList(value, values);
  if (result === "-") return <span className="text-gray-300">-</span>;
  return (
    <div className="space-y-1">
      {result.map((p) => (
        <div key={p}>{p}</div>
      ))}
    </div>
  );
}

export default function LogsAigatePage() {
  const [draftFilters, setDraftFilters] = useState<Filters>(getDefaultFilters);
  const [filters, setFilters] = useState<Filters>(getDefaultFilters);
  const [items, setItems] = useState<LogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const lastAutoRefreshAt = useRef(0);

  // AI 업무 파트너 목록 — 로그 대상 드롭다운을 동적 생성하기 위해 로드
  const [partnerOptions, setPartnerOptions] = useState<PartnerOption[]>([]);
  useEffect(() => {
    let ignore = false;
    fetch("/api/admin/ai-partners", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (ignore) return;
        const list: Array<{ id: number; name: string; sortOrder?: number; comingSoon?: boolean }> = Array.isArray(json?.data) ? json.data : [];
        const options: PartnerOption[] = list
          .filter((p) => p.name && !p.comingSoon) // coming_soon 카드는 클릭 자체가 막혀있어 로그 대상 옵션에서도 제외
          .map((p) => ({ id: p.id, name: p.name, sortOrder: p.sortOrder ?? 0 }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setPartnerOptions(options);
      })
      .catch((err) => {
        console.warn("[logs-aigate] failed to load partners", err);
      });
    return () => { ignore = true; };
  }, []);

  const totalPages = useMemo(() => {
    if (!totalCount) return 1;
    return Math.max(1, Math.ceil(totalCount / filters.size));
  }, [totalCount, filters.size]);

  const filteredItems = useMemo(() => {
    return aggregateEzAiRows(items).filter((it) => matchesPartnerFilter(it, filters.toolName));
  }, [items, filters.toolName]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { page, size, ...rest } = filters;
        const { items: list, totalCount: total } = await searchLogs(page, size, rest);
        if (ignore) return;
        setItems(list);
        setTotalCount(total);
      } catch (e: unknown) {
        if (ignore) return;
        setItems([]);
        setTotalCount(0);
        setError(e instanceof Error ? e.message : "로그 조회 중 오류");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [filters, refreshTick]);

  useEffect(() => {
    const trigger = () => {
      const now = Date.now();
      if (now - lastAutoRefreshAt.current < 1500) return;
      lastAutoRefreshAt.current = now;
      setRefreshTick((c) => c + 1);
    };
    const onVisible = () => { if (document.visibilityState === "visible") trigger(); };
    window.addEventListener("focus", trigger);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", trigger);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const handleSearch = () => setFilters({ ...draftFilters, page: 0 });
  const handleReset = () => {
    const next = getDefaultFilters();
    setDraftFilters(next);
    setFilters(next);
  };
  const movePage = (p: number) => setFilters((c) => ({ ...c, page: p }));
  const changeSize = (size: number) => setFilters((c) => ({ ...c, size, page: 0 }));

  const handleDraft = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => {
    setDraftFilters((c) => ({ ...c, [k]: v }));
  }, []);

  const handleDownload = async () => {
    setDownloadLoading(true);
    setError("");
    try {
      const { page: _p, size: _s, ...rest } = filters;
      void _p; void _s;
      const raw = await fetchAllPages((p, s) => searchLogs(p, s, rest));
      const grouped = aggregateEzAiRows(raw);
      const exportItems = filters.toolName
        ? grouped.filter((it) => matchesPartnerFilter(it, filters.toolName))
        : grouped;
      downloadLogsAsExcel(exportItems);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "로그 다운로드 중 오류");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-5">
        <h2 className="text-lg font-bold">AI 게이트 사용 로그</h2>
        <p className="text-xs text-gray-500 mt-1">AI 게이트 하위 서비스 사용 이력을 관리자가 확인하는 화면입니다.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">시작일</label>
            <input type="date" value={draftFilters.dateFrom}
              onChange={(e) => handleDraft("dateFrom", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">종료일</label>
            <input type="date" value={draftFilters.dateTo}
              onChange={(e) => handleDraft("dateTo", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">로그 대상</label>
            <select value={draftFilters.toolName}
              onChange={(e) => handleDraft("toolName", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 w-48">
              <option value="">전체</option>
              {partnerOptions.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">사용자명</label>
            <input type="text" placeholder="홍길동" value={draftFilters.userName}
              onChange={(e) => handleDraft("userName", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-32 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">부서명</label>
            <input type="text" placeholder="AXDX" value={draftFilters.departmentName}
              onChange={(e) => handleDraft("departmentName", e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 w-32 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSearch}
              className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-black transition-colors h-[34px]">
              조회
            </button>
            <button onClick={handleReset}
              className="bg-white text-gray-600 px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors border border-gray-300 h-[34px]">
              초기화
            </button>
          </div>
          <button onClick={handleDownload} disabled={loading || downloadLoading}
            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded text-sm hover:bg-emerald-100 transition-colors h-[34px] ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
            {downloadLoading ? "다운로드 중..." : "로그 다운로드"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-600">
          {error}
        </div>
      )}

      {/* Result Info */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">
          총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>건
        </p>
        <select value={filters.size} onChange={(e) => changeSize(Number(e.target.value))}
          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600">
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
          <option value={100}>100개씩</option>
          <option value={200}>200개씩</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm flex-1 min-h-0">
        <table className="w-full min-w-[2200px]">
          <thead className="sticky top-0 z-10">
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
            {loading ? (
              <tr>
                <td colSpan={16} className="px-3 py-10 text-center text-[13px] text-gray-400">
                  로그를 불러오는 중입니다.
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={16} className="px-3 py-10 text-center text-[13px] text-gray-400">
                  조회된 로그가 없습니다.
                </td>
              </tr>
            ) : (
              filteredItems.map((log) => (
                <tr key={log.logId}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors text-[12px] text-center">
                  <td className="px-3 py-2.5 text-gray-400 font-mono">{log.userKey || "-"}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{log.userName || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-600">{log.departmentName || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-600">{log.positionName || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                    <OccurredAtCell value={log.occurredAt} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{formatToolType(log.toolType)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{formatToolName(log.toolName)}</td>
                  <td className="px-3 py-2.5 text-gray-600 text-left">
                    <PurposeCell value={log.purpose} values={log.purposes} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{log.fpProjectCode || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-600 max-w-[220px] truncate">{log.fpProjectName || "-"}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatMenuName(log.menuName)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatButtonName(log.buttonName)}</td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">{formatDurationLabel(log.durationMs)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{log.rating != null ? `${log.rating}점` : "-"}</td>
                  <td className="px-3 py-2.5 text-[11px]">
                    {log.errorCode || log.errorMessage ? (
                      <span className="text-red-600">{formatErrorLogDisplayValue(log.errorCode || log.errorMessage)}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 font-mono text-[11px]">{log.clientIp || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={filters.page} totalPages={totalPages} onChange={movePage} />
    </div>
  );
}
