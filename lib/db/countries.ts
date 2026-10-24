import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, PAGE_SIZE } from "@/lib/db/util";

export type Country = {
  id: number; slug: string; name: string; iso_code: string | null;
  flag_url: string | null; is_historical: boolean; created_at: string;
};

export async function listCountries(f: { q?: string; historical?: "yes" | "no"; page?: number }) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  let q = sb.from("countries").select("*", { count: "exact" })
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (f.q) q = q.ilike("name", `%${f.q}%`);
  if (f.historical) q = q.eq("is_historical", f.historical === "yes");

  const { data, count, error } = await q;
  if (error) throw fail(error);
  return { rows: (data ?? []) as Country[], total: count ?? 0, pageSize: PAGE_SIZE, page };
}

export async function getCountry(id: number) {
  const sb = createAdminClient();
  const { data, error } = await sb.from("countries").select("*").eq("id", id).maybeSingle();
  if (error) throw fail(error);
  if (!data) return null;

  const head = { count: "exact" as const, head: true };
  const [clubs, teams, bios] = await Promise.all([
    sb.from("clubs").select("id", head).eq("country_id", id),
    sb.from("national_teams").select("id", head).eq("country_id", id),
    sb.from("biographies").select("id", head)
      .or(`birth_country_id.eq.${id},nationality_id.eq.${id}`),
  ]);

  return {
    ...(data as Country),
    usage: {
      clubs: clubs.count ?? 0,
      nationalTeams: teams.count ?? 0,
      biographies: bios.count ?? 0,
    },
  };
}

export async function listCountryOptions() {
  const { data, error } = await createAdminClient()
    .from("countries").select("id, name").order("name");
  if (error) throw fail(error);
  return (data ?? []) as { id: number; name: string }[];
}

export async function isoCodeTaken(iso: string, excludeId?: number) {
  const sb = createAdminClient();
  let q = sb.from("countries").select("id").eq("iso_code", iso);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q.maybeSingle();
  if (error) throw fail(error);
  return !!data;
}