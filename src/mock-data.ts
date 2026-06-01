// ── Mock data for demo version ──
// All real company/user data is replaced with fictional data

const names = ["김민수", "이지현", "박서준", "최유나", "정태영", "한소희", "오현우", "윤미래", "송재호", "장예진"];
const depts = ["기획팀", "개발팀", "마케팅팀", "운영팀", "디자인팀"];
const positions = ["사원", "대리", "과장", "차장", "부장"];
const jobs = ["팀원", "파트장", "팀장"];
const ips = ["192.168.1.10", "192.168.1.25", "10.0.0.42", "172.16.0.8", "192.168.2.100"];
const devices = ["PC", "Mobile"];
const oss = ["Windows 11", "macOS 14", "iOS 17", "Android 14"];
const browsers = ["Chrome 125", "Safari 18", "Edge 125", "Firefox 128"];
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/18.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile",
];
const tools = ["AI 문서 분석", "회의록 요약", "데이터 시각화", "코드 리뷰 봇", "번역 도우미"];
const purposes = ["업무 보고서 작성", "데이터 분석", "문서 번역", "코드 검토", "회의 정리"];
const menus = ["대시보드", "사용 로그", "AI 파트너", "메일 관리", "설정"];
const buttons = ["조회", "다운로드", "검색", "필터", "엑셀 내보내기", "상세보기"];
const urls = ["/dashboard", "/logs/login-history", "/ai-partners", "/mail", "/logs/click-history"];
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

// ── Login History ──  (fields match login-history page)
export function generateLoginHistory(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    rowNum: i + 1,
    userNo: `U${String(10000 + i)}`,
    userNm: randomItem(names),
    departmentNm: randomItem(depts),
    positionNm: randomItem(positions),
    jobNm: randomItem(jobs),
    ipAddress: randomItem(ips),
    userAgent: randomItem(userAgents),
    deviceGbn: randomItem(devices),
    osNm: randomItem(oss),
    browserNm: randomItem(browsers),
    createdDt: randomDate(30),
  }));
}

// ── Login Count ──  (fields match login-count page)
export function generateLoginCount(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    rowNum: i + 1,
    userNo: `U${String(10000 + i)}`,
    userNm: names[i % names.length],
    departmentNm: depts[i % depts.length],
    positionNm: positions[i % positions.length],
    jobNm: jobs[i % jobs.length],
    loginCount: Math.floor(Math.random() * 50) + 5,
  }));
}

// ── Download History ──  (fields match download-history page)
export function generateDownloadHistory(count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const f = randomItem(files);
    return {
      rowNum: i + 1,
      logNo: 2000 + i,
      fileNm: f,
      divisionNm: randomItem(depts),
      fileSize: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
      ipAddr: randomItem(ips),
      filePath: `/data/exports/${f}`,
      userNo: `U${String(10000 + i)}`,
      userId: `user${i + 1}`,
      userNm: randomItem(names),
      userDivisionNm: randomItem(depts),
      departmentNm: randomItem(depts),
      jobNm: randomItem(jobs),
      createDt: randomDate(14),
    };
  });
}

// ── Click History — 6 view types ──
export function generateClickList(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    rowNum: i + 1,
    userNo: `U${String(10000 + i)}`,
    userNm: randomItem(names),
    departmentNm: randomItem(depts),
    positionNm: randomItem(positions),
    jobNm: randomItem(jobs),
    clickDt: randomDate(14),
    pageNm: randomItem(menus),
    buttonNm: randomItem(buttons),
    url: randomItem(urls),
  }));
}

export function generateClickDateStat(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      rowNum: i + 1,
      clickDate: d.toISOString().slice(0, 10),
      pageNm: randomItem(menus),
      buttonNm: randomItem(buttons),
      url: randomItem(urls),
      totalClicks: Math.floor(Math.random() * 100) + 10,
    };
  });
}

export function generateClickButtonStat() {
  return buttons.map((b, i) => ({
    rowNum: i + 1,
    pageNm: randomItem(menus),
    buttonNm: b,
    url: randomItem(urls),
    totalClicks: Math.floor(Math.random() * 200) + 20,
  }));
}

export function generateClickUserButtonStat(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    rowNum: i + 1,
    userNo: `U${String(10000 + i)}`,
    userNm: randomItem(names),
    departmentNm: randomItem(depts),
    positionNm: randomItem(positions),
    jobNm: randomItem(jobs),
    pageNm: randomItem(menus),
    buttonNm: randomItem(buttons),
    url: randomItem(urls),
    totalClicks: Math.floor(Math.random() * 80) + 5,
  }));
}

export function generateClickUserStat(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    rowNum: i + 1,
    userNo: `U${String(10000 + i)}`,
    userNm: names[i % names.length],
    departmentNm: depts[i % depts.length],
    positionNm: positions[i % positions.length],
    jobNm: jobs[i % jobs.length],
    totalClicks: Math.floor(Math.random() * 80) + 5,
  }));
}

export function generateClickUserDateStat(count = 20) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i % 14));
    return {
      rowNum: i + 1,
      userNo: `U${String(10000 + i)}`,
      userNm: randomItem(names),
      departmentNm: randomItem(depts),
      positionNm: randomItem(positions),
      jobNm: randomItem(jobs),
      clickDate: d.toISOString().slice(0, 10),
      totalClicks: Math.floor(Math.random() * 50) + 3,
    };
  });
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

// ── Mail Types ──
export const MAIL_TYPE_LIST: { mailType: string; typeName: string }[] = [
  { mailType: "BA_PROPOSAL_SUBMITTED", typeName: "제안서 저작권 등록 완료" },
  { mailType: "BID_RESULT_ENTERED", typeName: "프로젝트 코드 발급 완료" },
  { mailType: "OPERATION_DATA_SUBMITTED", typeName: "운영자료 제출 완료" },
  { mailType: "PERFORMANCE_REPORT_SUBMITTED", typeName: "수행내역서 제출 완료" },
  { mailType: "PROJECT_CREATED", typeName: "신규 프로젝트 등록 안내" },
  { mailType: "PROPOSAL_SUBMITTED", typeName: "제안서 제출 완료 확인" },
];

// ── Mail History ──  (fields match mail page; response is { list, totalCount })
export function generateMailHistory(count = 25) {
  return Array.from({ length: count }, (_, i) => {
    const t = MAIL_TYPE_LIST[i % MAIL_TYPE_LIST.length];
    const ok = Math.random() > 0.12;
    return {
      historyNo: 5000 + i,
      mailType: t.mailType,
      subject: `[${t.typeName}] 안내 메일`,
      toList: `user${i + 1}@example.com`,
      ccList: i % 3 === 0 ? `manager${i + 1}@example.com` : null,
      bccList: null,
      status: ok ? "SUCCESS" : "FAIL",
      errorMessage: ok ? null : "SMTP timeout",
      sendDt: randomDate(30),
      body: `<p>${t.typeName} 처리가 완료되었습니다.</p>`,
    };
  });
}

// ── Mail Templates ──  (fields match mail-templates page; response is array)
export function generateMailTemplates() {
  return MAIL_TYPE_LIST.map((t) => ({
    mailType: t.mailType,
    typeName: t.typeName,
    subjectTemplate: `[${t.typeName}] {{projectTitle}}`,
    bodyTemplate: `<p>안녕하세요.</p><p>{{projectTitle}} 건의 ${t.typeName} 안내드립니다.</p>`,
    createDt: "2026-03-01 09:00:00",
    updateDt: "2026-05-01 14:30:00",
  }));
}

// ── Mail Recipients ──  (response is { TO, CC, BCC })
export function generateRecipients(mailType: string) {
  const mk = (recipientType: string, n: number, base: number) =>
    Array.from({ length: n }, (_, i) => ({
      recipientNo: base + i,
      name: randomItem(names),
      email: `${recipientType.toLowerCase()}${i + 1}@example.com`,
      department: randomItem(depts),
      recipientType,
      mailType,
    }));
  return {
    TO: mk("TO", 3, 6000),
    CC: mk("CC", 2, 6100),
    BCC: mk("BCC", 1, 6200),
  };
}

// ── AI Partners ──
export const AI_PARTNERS = [
  { id: 1, name: "AI 문서 분석", description: "문서를 업로드하면 AI가 핵심 내용을 분석하고 요약합니다.", url: "#", category: "core", accessType: "internal", icon: "📄", comingSoon: false, purposes: ["문서 분석", "요약 생성"], sortOrder: 1 },
  { id: 2, name: "회의록 요약", description: "회의 녹취록이나 텍스트를 입력하면 핵심 안건과 액션 아이템을 추출합니다.", url: "#", category: "core", accessType: "internal", icon: "📝", comingSoon: false, purposes: ["회의 정리", "액션 아이템"], sortOrder: 2 },
  { id: 3, name: "데이터 시각화", description: "엑셀 데이터를 업로드하면 자동으로 차트와 인사이트를 생성합니다.", url: "#", category: "core", accessType: "internal", icon: "📊", comingSoon: false, purposes: ["데이터 분석", "차트 생성"], sortOrder: 3 },
  { id: 4, name: "코드 리뷰 봇", description: "코드를 분석하여 버그, 보안 취약점, 개선 사항을 제안합니다.", url: "#", category: "lab", accessType: "external", icon: "🤖", comingSoon: false, purposes: ["코드 검토"], sortOrder: 4 },
  { id: 5, name: "번역 도우미", description: "다국어 문서를 실시간으로 번역하고 용어를 통일합니다.", url: "#", category: "lab", accessType: "external", icon: "🌐", comingSoon: true, purposes: ["문서 번역"], sortOrder: 5 },
];
