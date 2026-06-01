/**
 * 엑셀 다운로드 공통 유틸.
 *
 * ── 설계 원칙 ─────────────────────────────────────────────────────────
 * 모든 로그/이력 페이지의 엑셀 다운로드는 이 모듈을 거친다.
 *  1) `fetchAllPages`로 `/search` 엔드포인트를 페이지네이션 순회 → 전체 row 수집
 *  2) `exportToExcel`로 클라이언트사이드 xlsx 빌드 → `XLSX.writeFile`로 다운로드 트리거
 *
 * 백엔드(mice-dx-api)에 `/excel` 전용 native xlsx 엔드포인트가 따로 있지만
 * **클라이언트 공통 유틸 패턴을 의도적으로 유지**한다. 이유:
 *  - 페이지마다 헤더 구성·표기 포맷이 다른데 `mapRow`로 한 곳에서 통일하기 쉬움
 *  - 백엔드 엔드포인트를 쓰면 페이지마다 fetch + blob + Content-Disposition 파싱이
 *    중복되고, 일관성도 깨짐 (login-history, download-history 등과 패턴이 갈림)
 *  - 페이지네이션 totalCount만 정확하면 클라이언트 빌드도 충분히 안정적
 *
 * ── 과거 버그(2026-05) ────────────────────────────────────────────────
 * 버튼 클릭 히스토리 6개 통계 중 "사용자/버튼별 통계", "사용자/날짜별 통계" 다운로드만
 * 실패하며 빨간 에러 박스에 `Sheet name cannot contain : \ / ? * [ ]` 노출.
 *
 * 원인: `filenamePrefix`에 `/`가 들어간 라벨(`버튼 클릭 히스토리_사용자/버튼별 통계`)을
 * `book_append_sheet` 의 시트 이름으로도 그대로 사용 → sheetjs가 시트명 규칙 위반으로
 * 동기 throw → handleExcelDownload catch에서 setError 처리되며 다운로드 자체가 시작도
 * 못 함. (파일명 슬래시는 OS path separator로도 위험하므로 같이 sanitize)
 *
 * 따라서 다음 두 곳에서 항상 sanitize:
 *  - `buildExportFilename`: 파일명 path separator·OS 금지 문자 → `_`
 *  - `exportToExcel` 내부: 시트명 XLSX 금지 문자(`: \ / ? * [ ]`) → `_`, 31자 컷
 *
 * **호출부에서 라벨·prefix 손대지 말 것.** 여기서 일괄 처리해 모든 페이지에서 안전.
 */

import * as XLSX from "xlsx";

export type ExcelExportConfig<T> = {
  /** 파일명 prefix. 예: "AI 게이트_사용 로그" → "AI 게이트_사용 로그_YYMMDD.xlsx" */
  filenamePrefix: string;
  /** 시트 이름. 미지정 시 filenamePrefix 사용 */
  sheetName?: string;
  /** 1행에 들어갈 컬럼 헤더 */
  headers: string[];
  /** 각 데이터 row를 셀 배열로 변환 */
  mapRow: (item: T) => (string | number | null | undefined)[];
  /** 컬럼별 너비(문자 단위). 미지정 시 자동 */
  columnWidths?: number[];
};

/** YYMMDD 포맷 */
export function formatExportDate(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * 파일/디렉터리에서 금지된 문자를 `_`로 치환.
 * 슬래시(`/`, `\`)는 path separator로 해석돼 다운로드가 실패하므로 반드시 제거해야 함.
 * Windows 금지 문자(`:`, `*`, `?`, `"`, `<`, `>`, `|`)도 같이 정리.
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

/**
 * XLSX 시트 이름 규칙 적용.
 * - 금지 문자: `: \ / ? * [ ]` → 들어있으면 sheetjs 가 동기 throw
 *   ("Sheet name cannot contain : \ / ? * [ ]")
 * - 최대 31자: 초과 시 잘라냄
 * - 빈 문자열은 fallback "Sheet1"
 */
function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/:*?[\]]/g, "_").slice(0, 31);
  return cleaned.length > 0 ? cleaned : "Sheet1";
}

/** 파일명 생성: `<prefix>_YYMMDD.xlsx` (path separator·금지 문자는 `_`로 치환) */
export function buildExportFilename(prefix: string, date: Date = new Date()): string {
  return `${sanitizeFilename(prefix)}_${formatExportDate(date)}.xlsx`;
}

/** 데이터 배열을 엑셀 워크북으로 만들어 즉시 다운로드 트리거 */
export function exportToExcel<T>(items: T[], config: ExcelExportConfig<T>): void {
  const sheet = XLSX.utils.aoa_to_sheet([
    config.headers,
    ...items.map(config.mapRow),
  ]);

  if (config.columnWidths && config.columnWidths.length > 0) {
    sheet["!cols"] = config.columnWidths.map((wch) => ({ wch }));
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, sanitizeSheetName(config.sheetName ?? config.filenamePrefix));
  XLSX.writeFile(wb, buildExportFilename(config.filenamePrefix));
}

/**
 * 페이지네이션된 fetcher를 0번 페이지부터 totalCount까지 순회하며 전체 row 수집.
 * Mock·실API 어느 쪽이든 fetcher 시그니처만 맞추면 동일 사용.
 */
export async function fetchAllPages<T>(
  fetcher: (page: number, size: number) => Promise<{ items: T[]; totalCount: number }>,
  pageSize: number = 200,
): Promise<T[]> {
  let page = 0;
  let total = 0;
  const all: T[] = [];
  while (true) {
    const { items, totalCount } = await fetcher(page, pageSize);
    total = totalCount;
    all.push(...items);
    if (items.length === 0 || all.length >= total) break;
    page += 1;
  }
  return all;
}
