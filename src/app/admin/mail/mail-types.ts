export const MAIL_TYPES: { mail_type: string; type_name: string }[] = [
  { mail_type: "BA_PROPOSAL_SUBMITTED",       type_name: "제안서 저작권 등록 완료" },
  { mail_type: "BID_RESULT_ENTERED",          type_name: "프로젝트 코드 발급 완료" },
  { mail_type: "OPERATION_DATA_SUBMITTED",    type_name: "운영자료 제출 완료"      },
  { mail_type: "PERFORMANCE_REPORT_SUBMITTED",type_name: "수행내역서 제출 완료"    },
  { mail_type: "PROJECT_CREATED",             type_name: "신규 프로젝트 등록 안내" },
  { mail_type: "PROPOSAL_SUBMITTED",          type_name: "제안서 제출 완료 확인"   },
];

export const TYPE_NAME: Record<string, string> = Object.fromEntries(
  MAIL_TYPES.map(({ mail_type, type_name }) => [mail_type, type_name])
);