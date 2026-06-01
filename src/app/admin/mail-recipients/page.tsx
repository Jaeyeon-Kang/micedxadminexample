"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";

interface MailTemplate {
  mailType: string;
  typeName: string;
}

type RecipientType = "TO" | "CC" | "BCC";

interface Recipient {
  recipientNo: number;
  name: string;
  department: string;
  email: string;
  recipientType: RecipientType;
  useYn: "Y" | "N";
}

const TYPE_LABELS: Record<RecipientType, string> = {
  TO: "수신자",
  CC: "참조자",
  BCC: "숨은참조자",
};

const TYPE_COLORS: Record<RecipientType, string> = {
  TO: "bg-blue-50 text-blue-600",
  CC: "bg-green-50 text-green-600",
  BCC: "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = { name: "", department: "", email: "", recipientType: "TO" as RecipientType };

export default function MailRecipientsPage() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/mailing/templates`)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((list: MailTemplate[]) => {
        setTemplates(list);
        if (list.length > 0) fetchRecipients(list[0].mailType);
      })
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
  }, []);

  const fetchRecipients = (mailType: string) => {
    setSelectedId(mailType);
    setRecipients([]);
    setSelectedRows(new Set());
    setForm(EMPTY_FORM);
    setEditingNo(null);
    setRecipientsLoading(true);
    fetch(`${API_BASE_URL}/admin/mailing/templates/${mailType}/recipients`)
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data: Record<RecipientType, Recipient[]>) => {
        const flat = [
          ...(data.TO ?? []),
          ...(data.CC ?? []),
          ...(data.BCC ?? []),
        ];
        setRecipients(flat);
      })
      .catch(() => {})
      .finally(() => setRecipientsLoading(false));
  };

  const handleAdd = async () => {
    if (!form.name || !form.email) return;
    const url = editingNo !== null
      ? `${API_BASE_URL}/admin/mailing/templates/${selectedId}/recipients/${editingNo}/update`
      : `${API_BASE_URL}/admin/mailing/templates/${selectedId}/recipients/create`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: form.recipientType,
          name: form.name,
          department: form.department,
          email: form.email,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg = body?.errors?.[0]?.reason ?? body?.detailMessage ?? body?.errorMessage ?? `HTTP ${res.status}`;
        alert(msg);
        return;
      }
      setForm(EMPTY_FORM);
      setEditingNo(null);
      fetchRecipients(selectedId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    }
  };

  const handleEdit = (r: Recipient) => {
    setEditingNo(r.recipientNo);
    setForm({ name: r.name, department: r.department, email: r.email, recipientType: r.recipientType });
  };

  const handleDelete = async (no: number) => {
    if (!window.confirm("수신자를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/mailing/recipients/${no}/delete`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchRecipients(selectedId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`선택한 ${selectedRows.size}명을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mailing/recipients/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientNos: [...selectedRows] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchRecipients(selectedId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const toggleRow = (no: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(no) ? next.delete(no) : next.add(no);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRows(
      selectedRows.size === recipients.length
        ? new Set()
        : new Set(recipients.map((r) => r.recipientNo))
    );
  };

  const byType = (type: RecipientType) => recipients.filter((r) => r.recipientType === type);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-5 shrink-0">
        <h2 className="text-lg font-bold">메일 설정</h2>
        <p className="text-xs text-gray-500 mt-1">메일 템플릿별 수신자, 참조자, 숨은참조자를 관리합니다.</p>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Template List */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
            <p className="text-[11px] font-medium text-gray-500">템플릿 목록 ({templates.length})</p>
          </div>
          {templatesLoading ? (
            <div className="px-4 py-6 text-center text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.mailType}
                  onClick={() => fetchRecipients(t.mailType)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedId === t.mailType
                      ? "bg-orange-50 border-l-2 border-l-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className={`text-[13px] ${selectedId === t.mailType ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                    {t.typeName}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{t.mailType}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
          {/* Add / Edit Form */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 shrink-0">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
              {editingNo !== null ? "수신자 수정" : "수신자 추가"}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">이름 *</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">부서</label>
                <input
                  type="text"
                  placeholder="ICT사업부"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">메일 주소 *</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">구분</label>
                <select
                  value={form.recipientType}
                  onChange={(e) => setForm({ ...form, recipientType: e.target.value as RecipientType })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="TO">수신자</option>
                  <option value="CC">참조자</option>
                  <option value="BCC">숨은참조자</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAdd}
                disabled={!form.name || !form.email}
                className="bg-gray-900 text-white px-5 py-1.5 rounded text-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingNo !== null ? "수정 완료" : "추가"}
              </button>
              {editingNo !== null && (
                <button
                  onClick={() => { setEditingNo(null); setForm(EMPTY_FORM); }}
                  className="bg-white text-gray-600 px-5 py-1.5 rounded text-sm hover:bg-gray-50 border border-gray-300 transition-colors"
                >
                  취소
                </button>
              )}
            </div>
          </div>

          {/* Recipient Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-[13px] font-semibold text-gray-900">수신자 목록</h3>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span>수신 <strong className="text-gray-700">{byType("TO").length}</strong></span>
                  <span>참조 <strong className="text-gray-700">{byType("CC").length}</strong></span>
                  <span>숨은참조 <strong className="text-gray-700">{byType("BCC").length}</strong></span>
                </div>
              </div>
              {selectedRows.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
                >
                  선택 삭제 ({selectedRows.size})
                </button>
              )}
            </div>

            {recipientsLoading ? (
              <div className="py-12 text-center text-[13px] text-gray-400">불러오는 중...</div>
            ) : recipients.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-gray-400">
                등록된 수신자가 없습니다.
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="text-[11px] text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === recipients.length && recipients.length > 0}
                        onChange={toggleAll}
                        className="accent-orange-500"
                      />
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium">이름</th>
                    <th className="px-4 py-2.5 text-left font-medium">부서</th>
                    <th className="px-4 py-2.5 text-left font-medium">메일 주소</th>
                    <th className="px-4 py-2.5 text-center font-medium">구분</th>
                    <th className="px-4 py-2.5 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r) => (
                    <tr
                      key={r.recipientNo}
                      className={`border-b border-gray-100 last:border-b-0 text-[12px] transition-colors ${
                        selectedRows.has(r.recipientNo) ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(r.recipientNo)}
                          onChange={() => toggleRow(r.recipientNo)}
                          className="accent-orange-500"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{r.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{r.department || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600 font-mono">{r.email}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${TYPE_COLORS[r.recipientType]}`}>
                          {TYPE_LABELS[r.recipientType]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(r.recipientNo)}
                          className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}