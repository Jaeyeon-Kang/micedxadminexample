import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminShell from "./AdminShell";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MICE DX Admin - Demo",
  description: "MICE DX Admin Portal Demo Version",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="bg-blue-600 text-white text-center text-xs py-1.5 font-medium tracking-wide">
          DEMO VERSION — 포트폴리오용 데모입니다. 샘플 데이터를 사용합니다.
        </div>
        <AuthGuard>
          <AdminShell>{children}</AdminShell>
        </AuthGuard>
      </body>
    </html>
  );
}
