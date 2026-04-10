"use client";

import { useState } from "react";

const MOCK_USERS = [
  { id: 1, name: "김철수", email: "cskim@ezpmp.co.kr", dept: "ICT사업부", role: "사용자", lastLogin: "2026-04-10 09:15", status: "활성" },
  { id: 2, name: "이영희", email: "yhlee@ezpmp.co.kr", dept: "엔지니어링", role: "사용자", lastLogin: "2026-04-10 09:35", status: "활성" },
  { id: 3, name: "박민수", email: "mspark@ezpmp.co.kr", dept: "ICT사업부", role: "관리자", lastLogin: "2026-04-10 09:50", status: "활성" },
  { id: 4, name: "정수연", email: "syjung@ezpmp.co.kr", dept: "경영지원", role: "사용자", lastLogin: "2026-04-09 17:30", status: "활성" },
  { id: 5, name: "최진욱", email: "cju7942@ezpmp.co.kr", dept: "ICT사업부", role: "관리자", lastLogin: "2026-04-10 10:20", status: "활성" },
  { id: 6, name: "홍길동", email: "gdhong@ezpmp.co.kr", dept: "컨설팅", role: "사용자", lastLogin: "2026-03-28 14:00", status: "비활성" },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(
    (u) => u.name.includes(searchTerm) || u.email.includes(searchTerm) || u.dept.includes(searchTerm)
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">사용자 관리</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500">전체 사용자</p>
          <p className="text-xl font-bold">{MOCK_USERS.length}명</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500">활성 사용자</p>
          <p className="text-xl font-bold">{MOCK_USERS.filter((u) => u.status === "활성").length}명</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-500">관리자</p>
          <p className="text-xl font-bold">{MOCK_USERS.filter((u) => u.role === "관리자").length}명</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="이름, 이메일, 부서 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border border-gray-300 rounded px-4 py-2 text-sm text-gray-900 placeholder-gray-400 w-72 focus:outline-none focus:border-orange-500"
        />
        <button className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 transition-colors">
          사용자 추가
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">이름</th>
              <th className="text-left px-5 py-3 font-medium">이메일</th>
              <th className="text-left px-5 py-3 font-medium">부서</th>
              <th className="text-left px-5 py-3 font-medium">역할</th>
              <th className="text-left px-5 py-3 font-medium">마지막 로그인</th>
              <th className="text-left px-5 py-3 font-medium">상태</th>
              <th className="text-left px-5 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium">{user.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{user.email}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{user.dept}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    user.role === "관리자" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{user.lastLogin}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    user.status === "활성" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-xs text-orange-500 hover:text-orange-700 font-medium">편집</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
