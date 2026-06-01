"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Category = "core" | "lab";
type AccessType = "internal" | "external";

type Partner = {
  id: number;
  name: string;
  description: string;
  url: string;
  category: Category;
  accessType: AccessType;
  /** 카드에 표시할 이모지 아이콘. 빈 문자열이면 카테고리 기본값 사용. */
  icon: string;
  /** 외부 AI 서비스의 사용 목적 목록 (사용자가 AI Gate에서 복수 선택 가능). 내부 도구는 빈 배열. */
  purposes: string[];
  comingSoon: boolean;
  sortOrder: number;
  useYn?: string;
};

const DEFAULT_ICON: Record<Category, string> = {
  core: "⚡",
  lab: "🧪",
};

/** 등록·수정 모달에서 클릭으로 고를 수 있는 이모지 후보 */
const EMOJI_PALETTE = [
  "⚡", "🧪", "🤖", "🧠", "🔮", "✨", "💫", "🪄",
  "📝", "📋", "📊", "📈", "📑", "📄", "📚", "💡",
  "💼", "🏢", "🎯", "🎓", "🎨", "🖼️", "🖌️", "✏️",
  "💬", "📧", "🔗", "🌐", "🔍", "⌨️", "🖥️", "💻",
  "🚀", "🎉", "⭐", "✅", "🏆", "🔥", "🌟", "🎁",
];

const CATEGORY_LABELS: Record<Category, string> = {
  core: "맞춤형 Core AI",
  lab: "AI Lab (Beta)",
};

type ApiResponse<T> = {
  result?: string;
  data?: T;
  message?: string;
  errorCode?: string | null;
};

async function fetchPartners(): Promise<Partner[]> {
  console.log("[ai-partners] GET /api/admin/ai-partners");
  const res = await fetch("/api/admin/ai-partners", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<Partner[]>;
  if (json.result !== "SUCCESS") {
    throw new Error(json.message || json.errorCode || "목록 조회 실패");
  }
  return (json.data ?? []).filter((p) => (p.useYn ?? "Y") === "Y");
}

async function createPartner(form: PartnerFormValue): Promise<void> {
  console.log("[ai-partners] POST /api/admin/ai-partners", form.name);
  const res = await fetch("/api/admin/ai-partners", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<unknown>;
  if (json.result !== "SUCCESS") {
    throw new Error(json.message || json.errorCode || "등록 실패");
  }
}

async function updatePartner(id: number, form: PartnerFormValue): Promise<void> {
  console.log("[ai-partners] PUT /api/admin/ai-partners/" + id, form.name);
  const res = await fetch(`/api/admin/ai-partners/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<unknown>;
  if (json.result !== "SUCCESS") {
    throw new Error(json.message || json.errorCode || "수정 실패");
  }
}

async function deletePartner(id: number): Promise<void> {
  console.log("[ai-partners] DELETE /api/admin/ai-partners/" + id);
  const res = await fetch(`/api/admin/ai-partners/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<unknown>;
  if (json.result !== "SUCCESS") {
    throw new Error(json.message || json.errorCode || "삭제 실패");
  }
}

async function updatePartnersOrder(
  orders: { id: number; sortOrder: number }[],
): Promise<void> {
  console.log("[ai-partners] PUT /api/admin/ai-partners/order", orders);
  const res = await fetch("/api/admin/ai-partners/order", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<unknown>;
  if (json.result !== "SUCCESS") {
    throw new Error(json.message || json.errorCode || "순서 변경 실패");
  }
}

function Badge({
  variant,
  children,
}: {
  variant: "internal" | "external" | "coming";
  children: React.ReactNode;
}) {
  const styles: Record<typeof variant, string> = {
    internal: "bg-indigo-50 text-indigo-700 border-indigo-200",
    external: "bg-emerald-50 text-emerald-700 border-emerald-200",
    coming: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function CategoryIcon({
  category,
  icon,
}: {
  category: Category;
  icon?: string;
}) {
  const bg = category === "core" ? "bg-indigo-50" : "bg-emerald-50";
  const display = (icon && icon.trim()) || DEFAULT_ICON[category];
  return (
    <div
      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-[22px] leading-none`}
    >
      <span aria-hidden>{display}</span>
    </div>
  );
}

const ACTION_BTN_CLASS =
  "inline-flex items-center justify-center h-7 min-w-7 px-2 rounded border border-gray-200 text-[11px] text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

type PartnerCardProps = {
  partner: Partner;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: number, dir: -1 | 1) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (id: number) => void;
};

function PartnerCard({ partner, isFirst, isLast, onMove, onEdit, onDelete }: PartnerCardProps) {
  const canOpen = !partner.comingSoon && !!partner.url;

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {partner.comingSoon && <Badge variant="coming">COMING SOON</Badge>}
        {partner.accessType === "internal" ? (
          <Badge variant="internal">사내IP에서만 이용 가능</Badge>
        ) : (
          <Badge variant="external">외부 AI서비스 활용</Badge>
        )}
      </div>

      <CategoryIcon category={partner.category} icon={partner.icon} />

      <h3 className="mt-5 text-[15px] font-bold text-gray-900 mb-1.5">{partner.name}</h3>
      <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
        {partner.description || <span className="text-gray-300">설명 없음</span>}
      </p>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(partner.id, -1)}
            disabled={isFirst}
            aria-label="앞으로 이동"
            title="앞으로 이동"
            className={ACTION_BTN_CLASS}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onMove(partner.id, 1)}
            disabled={isLast}
            aria-label="뒤로 이동"
            title="뒤로 이동"
            className={ACTION_BTN_CLASS}
          >
            →
          </button>
        </div>
        <div className="flex items-center gap-1">
          {canOpen && (
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="URL 열기"
              title={partner.url}
              className={ACTION_BTN_CLASS}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
          <button
            type="button"
            onClick={() => onEdit(partner)}
            className={`${ACTION_BTN_CLASS} hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50`}
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(partner.id)}
            className={`${ACTION_BTN_CLASS} hover:text-red-600 hover:border-red-200 hover:bg-red-50`}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

type PartnerSectionProps = {
  title: string;
  partners: Partner[];
  /** AI 게이트 그리드와 동일하게 core 3열 / lab 4열 */
  gridClass: string;
  onMove: (id: number, dir: -1 | 1) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (id: number) => void;
};

function PartnerSection({ title, partners, gridClass, onMove, onEdit, onDelete }: PartnerSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-1 h-5 bg-indigo-500 rounded-sm" />
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        <span className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
          {partners.length}
        </span>
      </div>
      {partners.length === 0 ? (
        <p className="text-[12px] text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">
          등록된 AI 업무 파트너가 없습니다.
        </p>
      ) : (
        <div className={`grid ${gridClass} gap-5`}>
          {partners.map((p, i) => (
            <PartnerCard
              key={p.id}
              partner={p}
              isFirst={i === 0}
              isLast={i === partners.length - 1}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type PartnerFormValue = Omit<Partner, "id" | "sortOrder" | "useYn">;

function emptyForm(): PartnerFormValue {
  return {
    name: "",
    description: "",
    url: "",
    category: "core",
    accessType: "internal",
    icon: "",
    purposes: [],
    comingSoon: false,
  };
}

function IconPickerField({
  category,
  value,
  onChange,
}: {
  category: Category;
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const display = (value && value.trim()) || DEFAULT_ICON[category];
  const bg = category === "core" ? "bg-indigo-50" : "bg-emerald-50";

  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
        아이콘
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-[22px] leading-none border border-transparent hover:border-gray-300 transition-colors`}
          aria-label="아이콘 변경"
          title="클릭하여 아이콘 변경"
        >
          <span aria-hidden>{display}</span>
        </button>
        <span className="text-[11px] text-gray-400">
          클릭하여 이모지를 선택하세요. 비워두면 카테고리 기본 아이콘이 사용됩니다.
        </span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-auto text-[11px] text-gray-500 hover:text-gray-800 underline"
          >
            기본값으로
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PALETTE.map((e) => {
              const active = e === value;
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    onChange(e);
                    setOpen(false);
                  }}
                  className={`h-9 w-9 rounded-md text-[20px] leading-none transition-colors ${
                    active
                      ? "bg-orange-100 ring-2 ring-orange-300"
                      : "hover:bg-gray-100"
                  }`}
                  aria-label={`이모지 ${e}`}
                >
                  <span aria-hidden>{e}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <label className="text-[11px] text-gray-500 shrink-0">
              직접 입력:
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              maxLength={4}
              placeholder="🤖"
              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-[18px] focus:outline-none focus:border-orange-500"
            />
            <span className="text-[10px] text-gray-400">
              위 후보 외 다른 이모지를 직접 붙여넣어도 됩니다.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PurposeListField({
  purposes,
  onChange,
}: {
  purposes: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (purposes.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...purposes, v]);
    setDraft("");
  };

  const remove = (target: string) => {
    onChange(purposes.filter((p) => p !== target));
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-gray-600">
          사용 목적 <span className="text-gray-400">(외부 서비스)</span>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="text-[11px] font-medium text-orange-600 hover:text-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + 사용 목적 추가
        </button>
      </div>

      <div className="rounded border border-gray-300 px-2 py-2 focus-within:border-orange-500">
        {purposes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {purposes.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[12px] text-orange-700"
              >
                {p}
                <button
                  type="button"
                  onClick={() => remove(p)}
                  aria-label={`${p} 삭제`}
                  className="ml-0.5 text-orange-400 hover:text-orange-700 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="예) AI 서비스 정보 탐색 — 입력 후 엔터 또는 +사용 목적 추가"
          className="w-full text-sm focus:outline-none placeholder:text-gray-400"
        />
      </div>
      <p className="mt-1 text-[11px] text-gray-400">
        엔터 또는 우측 상단 버튼으로 여러 개 등록할 수 있습니다.
      </p>
    </div>
  );
}

type PartnerModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial: PartnerFormValue;
  onClose: () => void;
  onSubmit: (value: PartnerFormValue) => void;
};

// AI 게이트 카드 폭 기준 — core 3열은 폭이 넓고 lab 4열은 폭이 좁아 카테고리별로 다름.
const NAME_LIMIT_CORE = 20;
const NAME_LIMIT_LAB = 17;
const DESC_LIMIT_CORE = 96;
const DESC_LIMIT_LAB = 66;

function getNameLimit(category: Category) {
  return category === "core" ? NAME_LIMIT_CORE : NAME_LIMIT_LAB;
}

function getDescLimit(category: Category) {
  return category === "core" ? DESC_LIMIT_CORE : DESC_LIMIT_LAB;
}

function PartnerModal({ open, mode, initial, onClose, onSubmit }: PartnerModalProps) {
  const [value, setValue] = useState<PartnerFormValue>(initial);

  useMemo(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  if (!open) return null;

  const update = <K extends keyof PartnerFormValue>(key: K, v: PartnerFormValue[K]) => {
    setValue((cur) => ({ ...cur, [key]: v }));
  };

  const nameLimit = getNameLimit(value.category);
  const descLimit = getDescLimit(value.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.name.trim()) return;
    if (value.name.length > nameLimit) {
      alert(`이름은 ${nameLimit}자까지만 입력 가능합니다.`);
      return;
    }
    if (value.description.length > descLimit) {
      alert(`설명은 ${descLimit}자까지만 입력 가능합니다.`);
      return;
    }
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-[15px] font-bold text-gray-900">
            {mode === "create" ? "새 AI 업무 파트너 등록" : "AI 업무 파트너 수정"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value.name}
              onChange={(e) => update("name", e.target.value)}
              required
              maxLength={nameLimit}
              placeholder={`${nameLimit}자까지 작성 가능합니다.`}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            <div
              className={`mt-1 text-right text-[10px] ${
                value.name.length > nameLimit
                  ? "font-semibold text-red-500"
                  : "text-gray-400"
              }`}
            >
              {value.name.length} / {nameLimit}자
            </div>
          </div>

          <IconPickerField
            category={value.category}
            value={value.icon}
            onChange={(next) => update("icon", next)}
          />

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">URL</label>
            <input
              type="url"
              value={value.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">설명</label>
            <textarea
              value={value.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              maxLength={descLimit}
              placeholder={`${descLimit}자까지 작성 가능합니다.`}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
            />
            <div
              className={`mt-1 text-right text-[10px] ${
                value.description.length > descLimit
                  ? "font-semibold text-red-500"
                  : "text-gray-400"
              }`}
            >
              {value.description.length} / {descLimit}자
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">카테고리</label>
              <select
                value={value.category}
                onChange={(e) => update("category", e.target.value as Category)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="core">맞춤형 Core AI</option>
                <option value="lab">AI Lab (Beta)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">유형</label>
              <select
                value={value.accessType}
                onChange={(e) => update("accessType", e.target.value as AccessType)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="internal">내부 (사내IP 전용)</option>
                <option value="external">외부 (외부 AI 서비스)</option>
              </select>
            </div>
          </div>

          {value.accessType === "external" && (
            <PurposeListField
              purposes={value.purposes}
              onChange={(next) => update("purposes", next)}
            />
          )}

          <label className="flex items-center gap-2 text-[12px] text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.comingSoon}
              onChange={(e) => update("comingSoon", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            오픈 예정 (COMING SOON 배지 노출)
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 rounded border border-gray-300 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded bg-gray-900 hover:bg-black transition-colors"
            >
              {mode === "create" ? "등록" : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ConfirmModalProps = {
  open: boolean;
  targetName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteConfirmModal({ open, targetName, onCancel, onConfirm }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 className="text-[15px] font-bold text-gray-900">AI 업무 파트너 삭제</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-900 text-xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-gray-900 font-medium mb-1 break-keep">
                <span className="text-orange-600">{targetName}</span> 항목을 삭제할까요?
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                삭제 후에는 복구할 수 없습니다. AI 게이트에서 즉시 노출이 중단됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 rounded border border-gray-300 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm text-white rounded bg-red-500 hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 같은 카테고리 내에서 id 위치를 dir만큼 swap한 결과의 sortOrder 매핑을 만들어 반환.
 * 변경된 두 항목만 { id, sortOrder } 형태로 반환 (백엔드 PUT /order는 배열로 받음).
 */
function computeSwapOrders(
  partners: Partner[],
  id: number,
  dir: -1 | 1,
): { id: number; sortOrder: number }[] | null {
  const target = partners.find((p) => p.id === id);
  if (!target) return null;

  const peers = partners
    .filter((p) => p.category === target.category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = peers.findIndex((p) => p.id === id);
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx >= peers.length) return null;

  const swap = peers[swapIdx];
  return [
    { id: target.id, sortOrder: swap.sortOrder },
    { id: swap.id, sortOrder: target.sortOrder },
  ];
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: "total" | "live" | "coming" }) {
  const styles: Record<typeof tone, string> = {
    total: "bg-white border-gray-200 text-gray-900",
    live: "bg-emerald-50 border-emerald-200 text-emerald-700",
    coming: "bg-gray-100 border-gray-200 text-gray-500",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${styles[tone]}`}>
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}

export default function AiPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formInitial, setFormInitial] = useState<PartnerFormValue>(emptyForm());
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPartners();
      setPartners(list);
    } catch (e) {
      console.error("[ai-partners] reload failed", e);
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const corePartners = useMemo(
    () =>
      partners
        .filter((p) => p.category === "core")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [partners],
  );
  const labPartners = useMemo(
    () =>
      partners
        .filter((p) => p.category === "lab")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [partners],
  );

  const stats = useMemo(() => {
    const total = partners.length;
    const coming = partners.filter((p) => p.comingSoon).length;
    return { total, live: total - coming, coming };
  }, [partners]);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setFormInitial(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setModalMode("edit");
    setEditingId(partner.id);
    const { id: _id, sortOrder: _sortOrder, useYn: _useYn, ...rest } = partner;
    void _id;
    void _sortOrder;
    void _useYn;
    setFormInitial(rest);
    setModalOpen(true);
  };

  const handleSubmit = async (value: PartnerFormValue) => {
    try {
      if (modalMode === "create") {
        await createPartner(value);
      } else if (editingId != null) {
        await updatePartner(editingId, value);
      }
      setModalOpen(false);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
    }
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await deletePartner(id);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  };

  const deleteTarget = useMemo(
    () => partners.find((p) => p.id === deleteTargetId) ?? null,
    [partners, deleteTargetId],
  );

  const handleMove = async (id: number, dir: -1 | 1) => {
    const orders = computeSwapOrders(partners, id, dir);
    if (!orders) return;
    // 낙관적 업데이트
    setPartners((cur) =>
      cur.map((p) => {
        const next = orders.find((o) => o.id === p.id);
        return next ? { ...p, sortOrder: next.sortOrder } : p;
      }),
    );
    try {
      await updatePartnersOrder(orders);
    } catch (e) {
      console.error("[ai-partners] order update failed", e);
      alert(e instanceof Error ? e.message : "순서 변경에 실패했습니다.");
      await reload();
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">AI 업무 파트너 관리</h2>
          <p className="text-xs text-gray-500 mt-1">
            AI 게이트에 노출되는 AI 업무 파트너를 등록·수정하고 노출 순서·Coming Soon 여부를 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-black transition-colors shrink-0"
        >
          + 새 AI 업무 파트너
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <StatPill label="전체" value={stats.total} tone="total" />
        <StatPill label="서비스 중" value={stats.live} tone="live" />
        <StatPill label="오픈 예정" value={stats.coming} tone="coming" />
        <div className="ml-auto text-[11px] text-gray-400">
          카테고리별 순서는 ← → 버튼으로 조정합니다.
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[13px] text-gray-400">불러오는 중…</div>
      ) : (
        <>
          <PartnerSection
            title={CATEGORY_LABELS.core}
            partners={corePartners}
            gridClass="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            onMove={handleMove}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <PartnerSection
            title={CATEGORY_LABELS.lab}
            partners={labPartners}
            gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            onMove={handleMove}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      <PartnerModal
        open={modalOpen}
        mode={modalMode}
        initial={formInitial}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        open={deleteTarget !== null}
        targetName={deleteTarget?.name ?? ""}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
