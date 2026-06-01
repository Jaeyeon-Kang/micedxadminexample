// ── Mock data for demo version ──
// All real company/user data is replaced with fictional data

const names = ["김민수", "이지현", "박서준", "최유나", "정태영", "한소희", "오현우", "윤미래", "송재호", "장예진"];
const depts = ["기획팀", "개발팀", "마케팅팀", "운영팀", "디자인팀"];
const ips = ["192.168.1.10", "192.168.1.25", "10.0.0.42", "172.16.0.8", "192.168.2.100"];
const browsers = ["Chrome 125", "Safari 18", "Edge 125", "Firefox 128"];
const tools = ["AI 문서 분석", "회의록 요약", "데이터 시각화", "코드 리뷰 봇", "번역 도우미"];
const purposes = ["업무 보고서 작성", "데이터 분석", "문서 번역", "코드 검토", "회의 정리"];
const menus = ["대시보드", "사용 로그", "AI 파트너", "메일 관리", "설정"];
const buttons = ["조회", "다운로드", "검색", "필터", "엑셀 내보내기", "상세보기"];
const files = ["report_2026Q1.xlsx", "meeting_notes.pdf", "data_export.csv", "presentation.pptx", "analysis.docx"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 10) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d.toISOString().replace("T", " ").slice(0, 19);
}

// ── Session ──
export const SESSION_COOKIE = "micedxadmin_demo_session";

// ── Demo User ──
export const DEMO_USER = {
  userKey: "demo-user-001",
  userName: "데모 사용자",
  projectCd: "DEMO",
  siteId: 1,
  siteUserNo: 1,
  role: "ADMIN",
  companyNo: null,
  companyName: "데모 회사",
  departmentName: "AXDX팀",
  positionName: "관리자",
};

// ── Login History ──
export function generateLoginHistory(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    logId: 1000 + i,
    userName: randomItem(names),
    departmentName: randomItem(depts),
    loginAt: randomDate(30),
    clientIp: randomItem(ips),
    browserInfo: randomItem(browsers),
    loginType: "SSO",
    result: Math.random() > 0.1 ? "SUCCESS" : "FAIL",
  }));
}

// ── Login Count ──
export function generateLoginCount(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    userName: names[i % names.length],
    departmentName: depts[i % depts.length],
    totalCount: Math.floor(Math.random() * 50) + 5,
    lastLoginAt: randomDate(7),
  }));
}

// ── Download History ──
export function generateDownloadHistory(count = 15) {
  return Array.from({ length: count }, (_, i) => ({
    logId: 2000 + i,
    userName: randomItem(names),
    departmentName: randomItem(depts),
    fileName: randomItem(files),
    filePath: `/data/exports/${randomItem(files)}`,
    fileSize: Math.floor(Math.random() * 5000) + 100,
    downloadAt: randomDate(14),
    clientIp: randomItem(ips),
  }));
}

// ── Click History ──
export function generateClickHistory(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    logId: 3000 + i,
    userName: randomItem(names),
    departmentName: randomItem(depts),
    menuName: randomItem(menus),
    buttonName: randomItem(buttons),
    clickAt: randomDate(14),
    clientIp: randomItem(ips),
  }));
}

export function generateClickDateStat(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      date: d.toISOString().slice(0, 10),
      totalCount: Math.floor(Math.random() * 100) + 10,
    };
  });
}

export function generateClickButtonStat() {
  return buttons.map((b) => ({
    buttonName: b,
    totalCount: Math.floor(Math.random() * 200) + 20,
  }));
}

export function generateClickUserStat(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    userName: names[i % names.length],
    departmentName: depts[i % depts.length],
    totalCount: Math.floor(Math.random() * 80) + 5,
  }));
}

// ── AI Gate Logs ──
export function generateAIGateLogs(count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    logId: 4000 + i,
    serviceCd: "AIGATE",
    userKey: `user-${(i % 10) + 1}`,
    userName: randomItem(names),
    departmentName: randomItem(depts),
    positionName: "사원",
    occurredAt: randomDate(14),
    toolType: Math.random() > 0.3 ? "INTERNAL" : "EXTERNAL",
    toolName: randomItem(tools),
    purpose: randomItem(purposes),
    purposes: [randomItem(purposes)],
    fpProjectCode: `PRJ-${String(Math.floor(Math.random() * 900) + 100)}`,
    fpProjectName: `프로젝트 ${String.fromCharCode(65 + (i % 5))}`,
    menuName: randomItem(menus),
    buttonName: "실행하기",
    durationMs: Math.floor(Math.random() * 30000) + 1000,
    rating: Math.floor(Math.random() * 5) + 1,
    errorCode: null,
    clientIp: randomItem(ips),
  }));
}

// ── Mail History ──
export function generateMailHistory(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    mailId: 5000 + i,
    mailType: ["WELCOME", "REPORT", "NOTICE"][i % 3],
    subject: ["가입 환영 메일", "월간 리포트 발송", "공지사항 안내"][i % 3],
    recipientEmail: `user${i + 1}@demo.com`,
    recipientName: randomItem(names),
    sentAt: randomDate(30),
    status: Math.random() > 0.1 ? "SUCCESS" : "FAIL",
    errorMessage: null,
  }));
}

// ── Mail Templates ──
export const MAIL_TEMPLATES = [
  {
    mailType: "WELCOME",
    subject: "MICE DX 가입을 환영합니다",
    body: "<h1>환영합니다!</h1><p>MICE DX 플랫폼에 가입해 주셔서 감사합니다.</p><p>궁금한 점이 있으시면 언제든 문의해 주세요.</p>",
    updatedAt: "2026-05-01 10:00:00",
  },
  {
    mailType: "REPORT",
    subject: "월간 사용 리포트",
    body: "<h1>월간 리포트</h1><p>이번 달 사용 현황을 안내드립니다.</p><ul><li>로그인 횟수: {{loginCount}}</li><li>AI 도구 사용: {{toolUsage}}</li></ul>",
    updatedAt: "2026-04-15 14:30:00",
  },
];

// ── Mail Recipients ──
export function generateRecipients(mailType: string, count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: 6000 + i,
    mailType,
    email: `recipient${i + 1}@demo.com`,
    name: randomItem(names),
    createdAt: randomDate(60),
    active: true,
  }));
}

// ── AI Partners ──
export const AI_PARTNERS = [
  { id: 1, name: "AI 문서 분석", description: "문서를 업로드하면 AI가 핵심 내용을 분석하고 요약합니다.", url: "#", category: "core", accessType: "internal", icon: "📄", comingSoon: false, purposes: ["문서 분석", "요약 생성"], sortOrder: 1 },
  { id: 2, name: "회의록 요약", description: "회의 녹취록이나 텍스트를 입력하면 핵심 안건과 액션 아이템을 추출합니다.", url: "#", category: "core", accessType: "internal", icon: "📝", comingSoon: false, purposes: ["회의 정리", "액션 아이템"], sortOrder: 2 },
  { id: 3, name: "데이터 시각화", description: "엑셀 데이터를 업로드하면 자동으로 차트와 인사이트를 생성합니다.", url: "#", category: "core", accessType: "internal", icon: "📊", comingSoon: false, purposes: ["데이터 분석", "차트 생성"], sortOrder: 3 },
  { id: 4, name: "코드 리뷰 봇", description: "코드를 분석하여 버그, 보안 취약점, 개선 사항을 제안합니다.", url: "#", category: "lab", accessType: "external", icon: "🤖", comingSoon: false, purposes: ["코드 검토"], sortOrder: 4 },
  { id: 5, name: "번역 도우미", description: "다국어 문서를 실시간으로 번역하고 용어를 통일합니다.", url: "#", category: "lab", accessType: "external", icon: "🌐", comingSoon: true, purposes: ["문서 번역"], sortOrder: 5 },
];
