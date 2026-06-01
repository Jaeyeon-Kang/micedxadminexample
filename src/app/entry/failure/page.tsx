type SearchParams = Promise<{ reason?: string }>;

const REASON_MESSAGES: Record<string, { title: string; desc: string }> = {
  "missing-token": {
    title: "진입 토큰이 없습니다",
    desc: "유효한 진입 정보가 없습니다. MICE DX에서 다시 진입해주세요.",
  },
};

export default async function EntryFailurePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "unknown";
  const info = REASON_MESSAGES[reason] ?? {
    title: "진입 실패",
    desc: "관리자 페이지에 진입하지 못했습니다.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-8 py-10 text-center max-w-sm w-full">
        <h1 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h1>
        <p className="text-sm text-gray-500">{info.desc}</p>
        <p className="text-xs text-gray-400 font-mono mt-4">사유: {reason}</p>
      </div>
    </div>
  );
}
