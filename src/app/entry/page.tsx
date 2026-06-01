import { redirect } from "next/navigation";
import EntryExchange from "./EntryExchange";

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
  const returnTo = params.returnTo ?? "/dashboard";

  if (!entryToken) {
    redirect("/entry/failure?reason=missing-token");
  }

  return <EntryExchange entryToken={entryToken} returnTo={returnTo} />;
}
