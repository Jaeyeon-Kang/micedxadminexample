import { redirect } from "next/navigation";

type SearchParams = Promise<{
  entryToken?: string;
  returnTo?: string;
}>;

export default async function EntryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const entryToken = params.entryToken ?? "";
  const returnTo = params.returnTo ?? "/";

  console.log("[entry/page] entryToken:", entryToken ? `${entryToken.slice(0, 20)}…` : "(missing)");
  console.log("[entry/page] returnTo:", returnTo);

  if (!entryToken) {
    redirect("/entry/failure?reason=missing-token");
  }

  const target = new URLSearchParams({ entryToken, returnTo });
  redirect(`/api/admin/auth/exchange-entry-token?${target.toString()}`);
}
