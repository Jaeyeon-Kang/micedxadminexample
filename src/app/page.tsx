"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const NAV_ITEMS = [
  "Ongoing PRJ",
  "자료실",
  "프로젝트 실적",
  "서포트 센터",
  "AI 게이트",
];

const DATA_HUB_SUBMENU = [
  { label: "프로젝트 관리", href: "#", clickable: false },
  { label: "계정정보 이력사항", href: "#", clickable: false },
  { label: "그룹 관리", href: "#", clickable: false },
  { label: "권한 관리", href: "#", clickable: false },
  { label: "관리자 페이지", href: "/admin", clickable: true },
];

const MENU_DESCRIPTIONS = [
  {
    title: "Ongoing PRJ",
    badge: "UPDATE",
    badgeColor: "bg-green-500",
    desc: "수주된 올해의 프로젝트를 확인 할 수 있습니다.",
    sub: "신규 사업부 추가 : 비즈니스솔루션사업부, 스마트관광 사업부",
  },
  {
    title: "자료실",
    badge: "UPDATE",
    badgeColor: "bg-green-500",
    desc: "Ezpmp 전 사업부의 프로젝트 정보 및 각종 운영자료를 검색할 수 있습니다.",
  },
  {
    title: "서포트센터",
    desc: "필요한 제안/계약/운영단계 샘플양식 등을 다운로드 할 수 있습니다.",
  },
  {
    title: "프로젝트 실적",
    badge: "UPDATE",
    badgeColor: "bg-green-500",
    desc: '최근 5년 실적 리스트를 확인할 수 있습니다.\n*열람 가능 직급 : 팀장 이상',
  },
];

const SUPPORT_POSTS = [
  { date: "2025-12-16", title: "[공유] ChatGPT × Adobe (Express · Photoshop · Acrobat)" },
  { date: "2025-12-08", title: "[업무자동화/매크로] 서식 유지한 채 한 번에 번역! 구글 스프레드시트 번역기(MICE DX팀 제작 🔧)" },
  { date: "2025-11-24", title: "[GPT] EZ 프롬프트 생성기 출시 안내 (MICE DX팀 제작 🔧)" },
  { date: "2025-11-24", title: "[GPT] EZ 회의록 메이커 GPT (버전.2) 출시 안내 (MICE DX팀 제작 🔧)" },
  { date: "2025-11-24", title: "[공유] Claude 활용 사례에서 골라본 'MICE 맞춤 실무 기능' 5선" },
];

export default function Home() {
  const [dataHubOpen, setDataHubOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDataHubOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-10 bg-[#1e2a3a]" style={{ height: 52 }}>
        <div className="flex items-center">
          <Image src="/logo.png" alt="ezpmp" width={80} height={32} className="brightness-0 invert" style={{ height: 28, width: 'auto' }} />
        </div>
        <nav className="flex items-center h-full">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className="h-full flex items-center px-6 text-[13px] text-gray-300"
            >
              {item}
            </span>
          ))}
          {/* 데이터 허브 드롭다운 */}
          <div className="relative h-full" ref={dropdownRef}>
            <button
              onClick={() => setDataHubOpen(!dataHubOpen)}
              className={`h-full px-6 text-[13px] cursor-pointer ${
                dataHubOpen ? "text-orange-400" : "text-gray-300"
              }`}
            >
              데이터 허브
            </button>
            {dataHubOpen && (
              <div className="absolute top-full left-0 right-0 bg-[#1e2a3a] z-50">
                {DATA_HUB_SUBMENU.map((sub) => (
                  sub.clickable ? (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className="block px-4 py-3 text-[13px] text-center text-gray-300 hover:text-white cursor-pointer"
                    >
                      {sub.label}
                    </Link>
                  ) : (
                    <span
                      key={sub.label}
                      className="block px-4 py-3 text-[13px] text-center text-gray-500 cursor-default"
                    >
                      {sub.label}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="flex items-center gap-1.5 text-[13px] text-gray-300">
          <span className="text-sm">👤</span>
          <span>My Page</span>
          <span className="text-[10px]">▼</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#f5f0e8] py-16 px-8">
        <div className="max-w-6xl mx-auto flex gap-16">
          <div className="w-80 shrink-0">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-2 font-mono">
              PROJECT ARCHIVE
            </p>
            <h1 className="text-3xl font-black leading-tight text-gray-900">
              프로젝트<br />아카이브
            </h1>
            <p className="text-sm text-gray-600 mt-6 leading-relaxed">
              현재 실행중인 프로젝트가 궁금하다면?<br />
              과거 프로젝트 정보부터<br />
              단숨에 활용할 수 있는 샘플 문서까지<br />
              한 곳에서 검색해보세요.
            </p>
          </div>
          <div className="flex-1">
            <div className="divide-y divide-gray-300">
              {MENU_DESCRIPTIONS.map((item) => (
                <div
                  key={item.title}
                  className="py-5 flex items-start justify-between px-4 -mx-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <span className={`${item.badgeColor} text-white text-[10px] px-1.5 py-0.5 rounded font-medium`}>
                          {item.badge}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{item.desc}</p>
                    {item.sub && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-lg mt-1">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section className="bg-[#f0f0f0] py-12 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-6 text-center">
          {[
            { icon: "🔍", title: "데이터허브 1.1 사용매뉴얼", sub: "데이터허브 1.1 사용매뉴얼" },
            { icon: "🤖", title: "AI Gate 사용매뉴얼", sub: "AI Gate 사용매뉴얼" },
            { icon: "📋", title: "ezPDF 설치 가이드", sub: "ezPDF 설치 가이드" },
            { icon: "🔒", title: "ezPDF 설치 파일", sub: "ezPDF 설치 파일" },
            { icon: "📁", title: "프로젝트 폴더링 가이드", sub: "프로젝트 폴더링 가이드" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 p-4"
            >
              <span className="text-5xl">{item.icon}</span>
              <p className="text-xs text-gray-700 font-medium">{item.title}</p>
              <p className="text-[10px] text-gray-400 underline">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 서포트 센터 */}
      <section className="py-12 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 border-b-2 border-gray-900 pb-3">
            <h2 className="text-xl font-bold">서포트 센터</h2>
            <span className="text-sm text-gray-500">More →</span>
          </div>
          <div className="divide-y divide-gray-200">
            {SUPPORT_POSTS.map((post, i) => (
              <div key={i} className="py-5">
                <p className="text-xs text-gray-400 mb-1">{post.date}</p>
                <p className="text-[15px] text-gray-900">{post.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 의견 나누기 배너 */}
      <section className="bg-[#f5f5f5] py-6 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">더 나은</span>
            {" "}EZ데이터허브를{" "}
            <span className="font-medium text-gray-900">위해 여러분의</span>
            {" "}소중한 의견을{" "}
            <span className="font-medium text-gray-900">들려주세요!</span>
          </p>
          <span className="text-sm text-orange-500 border border-orange-400 rounded-full px-5 py-1.5 font-medium">
            의견 나누기
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f0f0f0] border-t border-gray-200 py-8 px-8">
        <div className="max-w-5xl mx-auto flex gap-10">
          <div className="shrink-0">
            <Image src="/logo.png" alt="ezpmp" width={80} height={32} style={{ height: 36, width: 'auto' }} />
            <p className="text-[10px] text-gray-400 mt-1">(주)이즈피엠피</p>
          </div>
          <div className="text-xs text-gray-500 leading-relaxed">
            <p className="font-medium text-gray-700 mb-1">(주)이즈피엠피</p>
            <p>제공되는 각종 정보는 사내 업무 목적으로만 활용하시길 바라며, 업무 이 외의 사용</p>
            <p>및 무단 유출을 절대 금지 합니다.</p>
            <p className="mt-2 text-gray-400">COPYRIGHT Ez pmp Co., Ltd. ALL rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
