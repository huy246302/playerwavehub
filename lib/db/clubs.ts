import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, one, PAGE_SIZE } from "@/lib/db/util";

type CountryRef = { id: number; name: string } | null;

export type ClubRow = {
  id: number; slug: string; name: string; short_name: string | null;
  city: string | null; founded_year: number | null; logo_url: string | null;
  updated_at: string; country: CountryRef;
};

const COLS =
  "id, slug, name, short_name, city, founded_year, logo_url, created_at, updated_at, country:countries(id, name)";

export async function listClubs(f: { q?: string; countryId?: number; page?: number }) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  let q = sb.from("clubs").select(COLS, { count: "exact" })
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (f.q) q = q.ilike("name", `%${f.q}%`);
  if (f.countryId) q = q.eq("country_id", f.countryId);

  const { data, count, error } = await q;
  if (error) throw fail(error);

  const rows: ClubRow[] = (data ?? []).map((r) => ({ ...r, country: one(r.country as CountryRef | CountryRef[]) }));
  return { rows, total: count ?? 0, pageSize: PAGE_SIZE, page };
}

export async function getClub(id: number) {
  const sb = createAdminClient();
  const { data, error } = await sb.from("clubs")
    .select("*, country:countries(id, name)").eq("id", id).maybeSingle();
  if (error) throw fail(error);
  if (!data) return null;

  const head = { count: "exact" as const, head: true };
  const [playerStints, coachStints, sources] = await Promise.all([
    sb.from("player_club_stints").select("id", head).eq("club_id", id),
    sb.from("coach_club_stints").select("id", head).eq("club_id", id),
    sb.from("club_sources").select("source_id", head).eq("club_id", id),
  ]);

  const ids = [data.created_by, data.updated_by].filter(Boolean) as string[];
  let profs: { id: string; display_name: string | null }[] = [];
  if (ids.length) {
    const { data: p } = await sb.from("profiles").select("id, display_name").in("id", ids);
    profs = p ?? [];
  }
  const name = (u: string | null) => profs.find((x) => x.id === u)?.display_name ?? null;

  return {
    ...data,
    country: one(data.country as CountryRef | CountryRef[]),
    created_by_name: name(data.created_by),
    updated_by_name: name(data.updated_by),
    usage: {
      playerStints: playerStints.count ?? 0,
      coachStints: coachStints.count ?? 0,
      sources: sources.count ?? 0,
    },
  };
}

export async function listClubOptions() {
  const { data, error } = await createAdminClient().from("clubs").select("id, name").order("name");
  if (error) throw fail(error);
  return (data ?? []) as { id: number; name: string }[];
}