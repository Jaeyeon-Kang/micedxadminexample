"use client";

import { useEffect, useState } from "react";
import { TYPE_NAME } from "../admin/mail/mail-types";
import { API_BASE_URL as API_BASE } from "@/config";
import { exportToExcel, fetchAllPages } from "@/lib/excel-export";
import { Pagination } from "@/components/Pagination";
const PAGE_SIZE_OPTIONS = [20,40,80];

interface MailHistory {
  historyNo: number;
  mailType: string;
  subject: string;
  toList: string;
  ccList: string | null;
  bccList: string | null;
  status: "SUCCESS" | "FAIL";
  errorMessage: string | null;
  sendDt: string;
  body: string | null;
}

const EXPORT_HEADERS = [
  "NO", "타입", "타입명", "제목", "수신자", "참조", "숨은참조",
  "상태", "오류 메시지", "발송 일시",
];

function formatExportDateCell(iso: string) {
  if (!iso) return "-";
  return iso.replace("T", " ").slice(0, 19);
}

function mapMailExportRow(m: MailHistory) {
  return [
    m.historyNo,
    m.mailType || "-",
    TYPE_NAME[m.mailType] ?? m.mailType ?? "-",
    m.subject || "-",
    m.toList || "-",
    m.ccList || "-",
    m.bccList || "-",
    m.status === "SUCCESS" ? "성공" : "실패",
    m.errorMessage || "-",
    formatExportDateCell(m.sendDt),
  ];
}

async function searchMailHistory(
  page: number,
  size: number,
): Promise<{ items: MailHistory[]; totalCount: number }> {
  const res = await fetch(`${API_BASE}/admin/mailing/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page, size }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return {
    items: (json.list ?? []) as MailHistory[],
    totalCount: json.totalCount ?? 0,
  };
}

function DetailModal({ mail, onClose }: { mail: MailHistory; onClose: () => void }) {
  const formatDate = (iso: string) => iso.replace("T", " ").slice(0, 19);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <span className="text-[13px] font-semibold text-gray-900">발송 상세</span>
            <span className="ml-2 text-[11px] text-gray-400 font-mono">#{mail.historyNo}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-3 text-[13px]">
          <Row label="상태">
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
              mail.status === "SUCCESS" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}>
              {mail.status === "SUCCESS" ? "성공" : "실패"}
            </span>
          </Row>
          <Row label="타입">
            <span className="text-gray-700">{TYPE_NAME[mail.mailType] ?? mail.mailType}</span>
            <span className="ml-2 text-[11px] text-gray-400 font-mono">{mail.mailType}</span>
          </Row>
          <Row label="발송 일시">{formatDate(mail.sendDt)}</Row>
          <Row label="수신자 (To)">{mail.toList || "-"}</Row>
          <Row label="참조 (CC)">{mail.ccList || "-"}</Row>
          <Row label="숨은참조 (BCC)">{mail.bccList || "-"}</Row>
          <Row label="제목">{mail.subject || "-"}</Row>

          {mail.errorMessage && (
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">오류 메시지</p>
              <pre className="bg-red-50 text-red-600 text-[11px] rounded p-3 whitespace-pre-wrap break-all font-mono leading-relaxed">
                {mail.errorMessage}
              </pre>
            </div>
          )}

          {mail.body && (
            <div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">본문</p>
              <pre className="bg-gray-50 text-gray-700 text-[12px] rounded p-3 whitespace-pre-wrap break-all leading-relaxed border border-gray-100">
                {mail.body}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-28 shrink-0 text-[11px] font-medium text-gray-400 pt-0.5">{label}</span>
      <span className="text-gray-700 break-all">{children}</span>
    </div>
  );
}

export default function MailLogsPage() {
  const [data, setData] = useState<MailHistory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MailHistory | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchMailHistory(page, pageSize)
      .then(({ items, totalCount }) => {
        setData(items);
        setTotalCount(totalCount);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const formatDate = (iso: string) => iso.replace("T", " ").slice(0, 16);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {selected && <DetailModal mail={selected} onClose={() => setSelected(null)} />}

      <div className="mb-5 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold">발송내역</h2>
          <p className="text-xs text-gray-500 mt-1">메일 발송 이력을 조회하는 화면입니다.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <span>페이지당</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-[12px] text-gray-700 bg-white focus:outline-none focus:border-orange-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}건</option>
              ))}
            </select>
          </div>
          <button
            onClick={async () => {
              try {
                const all = await fetchAllPages((p, s) => searchMailHistory(p, s));
                exportToExcel(all, {
                  filenamePrefix: "메일 발송 내역",
                  headers: EXPORT_HEADERS,
                  mapRow: mapMailExportRow,
                });
              } catch (e) {
                setError(e instanceof Error ? e.message : "다운로드 실패");
              }
            }}
            className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-1.5 rounded text-sm hover:bg-emerald-100 transition-colors"
          >
            내역 다운로드
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <span className="text-[13px] font-semibold text-gray-900">전체 {totalCount}건</span>
          <span className="text-[11px] text-gray-400">{page + 1} / {totalPages || 1} 페이지</span>
        </div>

        {error && (
          <div className="px-5 py-4 text-[13px] text-red-500 shrink-0">불러오기 실패: {error}</div>
        )}

        <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50 text-center">
              <th className="px-4 py-3 font-medium w-8">#</th>
              <th className="px-4 py-3 font-medium">타입</th>
              <th className="px-4 py-3 font-medium">수신자</th>
              <th className="px-4 py-3 font-medium text-left">제목</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">일시</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 && !error ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[13px] text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.map((mail, i) => (
                <tr
                  key={mail.historyNo}
                  onClick={() => setSelected(mail)}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-orange-50 cursor-pointer transition-colors text-[12px] text-center"
                >
                  <td className="px-4 py-3 text-gray-400 text-[11px]">
                    {page * pageSize + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[12px] text-gray-700">{TYPE_NAME[mail.mailType] ?? mail.mailType}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">{mail.mailType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{mail.toList}</td>
                  <td className="px-4 py-3 text-gray-700 text-left max-w-xs truncate">
                    {mail.subject || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      mail.status === "SUCCESS" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    }`}>
                      {mail.status === "SUCCESS" ? "성공" : "실패"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(mail.sendDt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}