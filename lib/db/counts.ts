import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export const COUNT_TABLES = [
  "biographies", "players", "coaches", "clubs", "national_teams", "countries", "sources",
] as const;

export const getCounts = cache(async () => {
  const sb = createAdminClient();
  const results = await Promise.all(
    COUNT_TABLES.map((t) => sb.from(t).select("*", { count: "exact", head: true }))
  );
  return Object.fromEntries(
    COUNT_TABLES.map((t, i) => [t, results[i].count ?? 0])
  ) as Record<(typeof COUNT_TABLES)[number], number>;
});