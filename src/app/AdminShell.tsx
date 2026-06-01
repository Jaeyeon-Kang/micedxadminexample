"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MICEDX_HOME_URL } from "@/config";
import CurrentUserBadge from "@/components/CurrentUser";

type SidebarItem = {
  label: string;
  href: string;
  children?: SidebarItem[];
};

type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "대시보드",
    items: [
      { label: "데이터허브 대시보드", href: "/dashboard" },
      { label: "AI 게이트 대시보드", href: "/dashboard/ai-gate" },
    ],
  },
  {
    title: "사용 로그",
    items: [
      {
        label: "데이터허브 사용 로그",
        href: "/logs",
        children: [
          { label: "로그인", href: "/logs/login-history" },
          { label: "다운로드", href: "/logs/download-history" },
          { label: "로그인 카운트", href: "/logs/login-count" },
          { label: "버튼 클릭 히스토리", href: "/logs/click-history" },
        ],
      },
      { label: "AI 게이트 사용 로그", href: "/logs-aigate" },
    ],
  },
  {
    title: "메일 관리",
    items: [
      { label: "발송내역", href: "/mail" },
      { label: "메일 설정", href: "/admin/mail-recipients" },
      { label: "메일 템플릿", href: "/mail-templates" },
    ],
  },
  {
    title: "AI 업무 파트너",
    items: [
      { label: "AI 업무 파트너 관리", href: "/ai-partners" },
    ],
  },
];

function isChildActive(item: SidebarItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
  );
}

function SidebarNavItem({
  item,
  pathname,
  depth = 0,
}: {
  item: SidebarItem;
  pathname: string;
  depth?: number;
}) {
  const hasChildren = !!item.children && item.children.length > 0;
  const childActive = hasChildren && isChildActive(item, pathname);
  const [isOpen, setIsOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setIsOpen(true);
  }, [childActive]);

  const isActive = pathname === item.href;
  const paddingLeft = depth === 0 ? "pl-4" : "pl-8";
  const fontSize = "text-[13px]";
  const activeClass =
    "bg-orange-50 text-orange-600 !border-orange-500 font-semibold";
  const inactiveClass =
    depth === 0
      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50";
  const baseClass = `pr-5 py-2 ${paddingLeft} ${fontSize} transition-colors border-l-4 border-transparent`;

  if (hasChildren) {
    const toggleClass = `w-full flex items-center justify-between ${baseClass} ${
      childActive && !isActive ? "text-gray-900 font-medium" : inactiveClass
    }`;
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className={toggleClass}
        >
          <span>{item.label}</span>
          <span
            className={`text-[14px] text-gray-600 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            ▸
          </span>
        </button>
        {isOpen && (
          <div>
            {item.children!.map((child) => (
              <SidebarNavItem
                key={child.href}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  const leafClass = `block ${baseClass} ${isActive ? activeClass : inactiveClass}`;

  return (
    <Link href={item.href} className={leafClass}>
      {item.label}
    </Link>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Left Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <a
          href={MICEDX_HOME_URL}
          className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-bold text-gray-900">MICE DX</span>
          <span className="text-[10px] text-orange-500 font-semibold ml-auto">Admin</span>
        </a>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_SECTIONS.map((section, index) => (
            <div key={section.title ?? `section-${index}`} className="mb-3">
              {section.title ? (
                <p className="px-5 pt-3 pb-1.5 text-[13px] font-bold text-gray-900">
                  {section.title}
                </p>
              ) : null}
              {section.items.map((item) => (
                <SidebarNavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 bg-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white">AXDX 관리자</span>
          </div>
          <div className="flex items-center gap-4">
            <CurrentUserBadge />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
