"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_SECTIONS = [
  {
    title: "대시보드",
    items: [
      { label: "대시보드", href: "/admin/dashboard" },
    ],
  },
  {
    title: "사용 로그",
    items: [
      { label: "MICE DX 사용로그", href: "/admin/logs" },
      { label: "AI Gate 사용로그", href: "/admin/logs-aigate" },
    ],
  },
  {
    title: "메일 관리",
    items: [
      { label: "메일 설정", href: "/admin/mail" },
      { label: "메일 템플릿", href: "/admin/mail-templates" },
    ],
  },
];

export default function AdminLayout({
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
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg font-bold">
            <span className="text-orange-500">ez</span>
            <span className="text-gray-900">pmp</span>
          </span>
          <span className="text-[10px] text-orange-500 font-semibold ml-auto">Admin</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="mb-3">
              <p className="px-5 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-5 py-2 text-[13px] transition-colors ${
                      isActive
                        ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 px-5 py-3">
          <Link
            href="/"
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← MICE DX 홈으로
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - MICE DX 헤더 스타일 */}
        <header className="h-12 bg-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-white">MICE DX 관리자</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">admin@ezpmp.co.kr</span>
            <span className="text-xs text-gray-400">|</span>
            <button className="text-xs text-gray-400 hover:text-white transition-colors">
              로그아웃
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
