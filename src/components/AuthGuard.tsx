"use client";

// Demo version — always authenticated
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
