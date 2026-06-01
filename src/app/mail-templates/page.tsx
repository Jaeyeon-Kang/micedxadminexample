"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from "@/config";

interface MailTemplate {
  mailType: string;
  typeName: string;
  subjectTemplate: string;
  bodyTemplate: string;
  useYn: "Y" | "N";
  delYn: "Y" | "N";
  createDt: string;
  updateDt: string | null;
}

interface Recipient {
  recipientNo: number;
  name: string;
  email: string;
  department: string;
  recipientType: "TO" | "CC" | "BCC";
  useYn: "Y" | "N";
}

interface RecipientsResponse {
  TO: Recipient[];
  CC: Recipient[];
  BCC: Recipient[];
}

function TestSendModal({
  mailType,
  typeName,
  onClose,
}: {
  mailType: string;
  typeName: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<RecipientsResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [workCode, setWorkCode] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/admin/mailing/templates/${mailType}/recipients`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: RecipientsResponse) => setRecipients(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [mailType]);

  const handleSend = async () => {
    if (!workCode.trim()) { setSendResult({ ok: false, text: "workCode를 입력해주세요." }); return; }
    if (!projectTitle.trim()) { setSendResult({ ok: false, text: "프로젝트명을 입력해주세요." }); return; }
    if (!window.confirm(`[${typeName}] 테스트 메일을 발송하시겠습니까?`)) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/mailing/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailType, workCode: workCode.trim(), projectTitle: projectTitle.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSendResult({ ok: true, text: "테스트 메일이 발송되었습니다." });
    } catch (e: unknown) {
      setSendResult({ ok: false, text: e instanceof Error ? e.message : "발송 실패" });
    } finally {
      setSending(false);
    }
  };

  const totalCount =
    (recipients?.TO.length ?? 0) +
    (recipients?.CC.length ?? 0) +
    (recipients?.BCC.length ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">테스트 발송</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{mailType} · {typeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-center text-[13px] text-gray-400 py-8">수신자 목록 조회 중...</p>
          )}
          {error && (
            <p className="text-center text-[13px] text-red-500 py-8">오류: {error}</p>
          )}
          {recipients && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">workCode</label>
                  <input
                    type="text"
                    placeholder="예) 241016"
                    value={workCode}
                    onChange={(e) => setWorkCode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">프로젝트명</label>
                  <input
                    type="text"
                    placeholder="예) 2026 Busan Expo"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <hr className="border-gray-100" />
              {(["TO", "CC", "BCC"] as const).map((type) => {
                const list = recipients[type];
                if (list.length === 0) return null;
                return (
                  <div key={type}>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      {type} <span className="font-normal text-gray-400">({list.length}명)</span>
                    </p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {list.map((r, i) => (
                        <div
                          key={r.recipientNo}
                          className={`flex items-center gap-3 px-3 py-2.5 ${
                            i < list.length - 1 ? "border-b border-gray-100" : ""
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
                            {r.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-900">
                              {r.name}{" "}
                              <span className="text-[11px] text-gray-400 font-normal">{r.department}</span>
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono truncate">{r.email}</p>
                          </div>
                          {r.useYn === "Y" ? (
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">활성</span>
                          ) : (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">비활성</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {totalCount === 0 && (
                <p className="text-center text-[13px] text-gray-400 py-4">등록된 수신자가 없습니다.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="flex-1">
            {sendResult && (
              <p className={`text-[12px] ${sendResult.ok ? "text-green-600" : "text-red-500"}`}>
                {sendResult.text}
              </p>
            )}
            {recipients && !sendResult && (
              <p className="text-[11px] text-gray-400">
                총 {totalCount}명에게 발송됩니다.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loading || !!error || totalCount === 0}
            className="px-5 py-1.5 rounded text-sm bg-gray-900 text-white hover:bg-black transition-colors disabled:opacity-40"
          >
            {sending ? "발송 중..." : "발송"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/admin/mailing/templates`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((list: MailTemplate[]) => {
        setTemplates(list);
        if (list.length > 0) handleSelect(list[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (t: MailTemplate) => {
    setSelected(t);
    setEditSubject(t.subjectTemplate);
    setEditBody(t.bodyTemplate);
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    if (!window.confirm("템플릿을 저장하시겠습니까?")) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/mailing/templates/${selected.mailType}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            typeName: selected.typeName,
            subjectTemplate: editSubject,
            bodyTemplate: editBody,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveMsg({ ok: true, text: "저장되었습니다." });
      setTemplates((prev) =>
        prev.map((t) =>
          t.mailType === selected.mailType
            ? { ...t, subjectTemplate: editSubject, bodyTemplate: editBody, updateDt: new Date().toISOString() }
            : t
        )
      );
      setSelected((prev) =>
        prev ? { ...prev, subjectTemplate: editSubject, bodyTemplate: editBody, updateDt: new Date().toISOString() } : prev
      );
    } catch (e: unknown) {
      setSaveMsg({ ok: false, text: e instanceof Error ? e.message : "저장 실패" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {showTestModal && selected && (
        <TestSendModal
          mailType={selected.mailType}
          typeName={selected.typeName}
          onClose={() => setShowTestModal(false)}
        />
      )}

      <div className="mb-5 shrink-0">
        <h2 className="text-lg font-bold">메일 템플릿</h2>
        <p className="text-xs text-gray-500 mt-1">메일 발송에 사용되는 템플릿을 관리하는 화면입니다.</p>
      </div>

      {error && (
        <div className="mb-4 text-[13px] text-red-500 shrink-0">불러오기 실패: {error}</div>
      )}

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Template List */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
            <p className="text-[11px] font-medium text-gray-500">
              템플릿 목록 ({templates.length})
            </p>
          </div>
          {loading ? (
            <div className="px-4 py-6 text-center text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {templates.map((t) => (
                <button
                  key={t.mailType}
                  onClick={() => handleSelect(t)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selected?.mailType === t.mailType
                      ? "bg-orange-50 border-l-2 border-l-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className={`text-[13px] truncate ${selected?.mailType === t.mailType ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                    {t.typeName}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{t.mailType}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template Editor */}
        {selected && (
          <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[13px] font-semibold text-gray-900">{selected.typeName}</span>
                <span className="ml-2 text-[11px] text-gray-400 font-mono">{selected.mailType}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                {selected.updateDt
                  ? `수정 ${selected.updateDt.slice(0, 10)}`
                  : `등록 ${selected.createDt.slice(0, 10)}`}
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">메일 제목 패턴</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  메일 본문{" "}
                  <span className="text-gray-400 font-normal">
                    (변수: {"{projectTitle}"}, {"{workCode}"}, {"{today}"}, {"{dueDate}"})
                  </span>
                </label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={12}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {saveMsg && (
                <p className={`text-[12px] ${saveMsg.ok ? "text-green-600" : "text-red-500"}`}>
                  {saveMsg.text}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gray-900 text-white px-5 py-1.5 rounded text-sm hover:bg-black transition-colors disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "템플릿 저장"}
                </button>
                <button
                  onClick={() => setShowTestModal(true)}
                  className="bg-white text-gray-600 px-5 py-1.5 rounded text-sm hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  테스트 발송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}