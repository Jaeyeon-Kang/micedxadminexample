"use client";

/**
 * 청크식 페이지네이션 — 한국 관리자 페이지에서 흔한 방식.
 * 5개씩 묶인 페이지가 표시되고, 사용자가 청크를 벗어나면 한꺼번에 다음 청크로 이동.
 */
export function getPageNumbers(
  current: number,
  total: number,
  chunkSize: number = 5,
): number[] {
  if (total <= 0) return [];
  const chunkIndex = Math.floor(current / chunkSize);
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, total);
  return Array.from({ length: end - start }, (_, i) => start + i);
}

type PaginationProps = {
  /** 0-based 현재 페이지 인덱스 */
  page: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 클릭 시 호출. 0-based 인덱스 전달 */
  onChange: (page: number) => void;
  /** 청크당 페이지 수 (기본 5) */
  chunkSize?: number;
  /** 추가 클래스 */
  className?: string;
};

const BTN_BASE =
  "w-7 h-7 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed";
const BTN_HOVER = " hover:bg-gray-200";
const BTN_ACTIVE = "w-7 h-7 rounded text-xs bg-orange-500 text-white";

export function Pagination({
  page,
  totalPages,
  onChange,
  chunkSize = 5,
  className = "",
}: PaginationProps) {
  if (totalPages <= 0) return null;
  const pages = getPageNumbers(page, totalPages, chunkSize);
  const isFirst = page <= 0;
  const isLast = page + 1 >= totalPages;

  return (
    <div
      className={`flex items-center justify-center mt-4 gap-1 shrink-0 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(0)}
        disabled={isFirst}
        className={BTN_BASE}
      >
        «
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={isFirst}
        className={BTN_BASE}
      >
        ‹
      </button>
      {pages.map((n) => {
        const active = page === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={active ? BTN_ACTIVE : BTN_BASE + BTN_HOVER}
          >
            {n + 1}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={isLast}
        className={BTN_BASE}
      >
        ›
      </button>
      <button
        type="button"
        onClick={() => onChange(totalPages - 1)}
        disabled={isLast}
        className={BTN_BASE}
      >
        »
      </button>
    </div>
  );
}
