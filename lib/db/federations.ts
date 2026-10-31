import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, one, PAGE_SIZE } from "@/lib/db/util";

type CountryRef = { id: number; name: string } | null;

export type FederationStatus = "active" | "defunct";

export type FederationRow = {
  id: number; slug: string; name: string; short_name: string | null;
  confederation: string | null; founded_year: number; ended_year: number | null;
  logo_url: string | null; updated_at: string; country: CountryRef;
};

const COLS =
  "id, slug, name, short_name, confederation, founded_year, ended_year, logo_url, created_at, updated_at, country:countries(id, name)";

export async function listFederations(f: {
  q?: string; countryId?: number; status?: FederationStatus; page?: number;
}) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  let q = sb.from("federations").select(COLS, { count: "exact" })
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (f.q) q = q.ilike("name", `%${f.q}%`);
  if (f.countryId) q = q.eq("country_id", f.countryId);
  if (f.status === "active") q = q.is("ended_year", null);
  if (f.status === "defunct") q = q.not("ended_year", "is", null);

  const { data, count, error } = await q;
  if (error) throw fail(error);

  const rows: FederationRow[] = (data ?? []).map((r) => ({
    ...r, country: one(r.country as CountryRef | CountryRef[]),
  }));
  return { rows, total: count ?? 0, pageSize: PAGE_SIZE, page };
}

export async function statusCounts() {
  const sb = createAdminClient();
  const head = { count: "exact" as const, head: true };
  const [all, defunct] = await Promise.all([
    sb.from("federations").select("id", head),
    sb.from("federations").select("id", head).not("ended_year", "is", null),
  ]);
  const total = all.count ?? 0;
  const ended = defunct.count ?? 0;
  return { all: total, active: total - ended, defunct: ended };
}

export async function getFederation(id: number) {
  const sb = createAdminClient();
  const { data, error } = await sb.from("federations")
    .select("*, country:countries(id, name)").eq("id", id).maybeSingle();
  if (error) throw fail(error);
  if (!data) return null;

  const head = { count: "exact" as const, head: true };
  const [nationalTeams, clubs] = await Promise.all([
    sb.from("national_teams").select("id", head).eq("federation_id", id),
    sb.from("clubs").select("id", head).eq("federation_id", id),
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
    usage: { nationalTeams: nationalTeams.count ?? 0, clubs: clubs.count ?? 0 },
  };
}

// For dropdowns (national team and club forms). country_id lets a form filter by country.
export async function listFederationOptions() {
  const { data, error } = await createAdminClient()
    .from("federations").select("id, name, country_id, founded_year, ended_year").order("name");
  if (error) throw fail(error);
  return (data ?? []) as {
    id: number; name: string; country_id: number; founded_year: number; ended_year: number | null;
  }[];
}

// Every country, historical ones included, so a federation can belong to e.g. the USSR.
export async function listFederationCountryOptions() {
  const { data, error } = await createAdminClient()
    .from("countries").select("id, name, is_historical").order("name");
  if (error) throw fail(error);
  return (data ?? []) as { id: number; name: string; is_historical: boolean }[];
}
