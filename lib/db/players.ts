import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, PAGE_SIZE } from "@/lib/db/util";

export type Nationality = {
  id: number; name: string; demonym: string | null; is_historical: boolean;
} | null;

type Person = {
  id: number; full_name: string; display_name: string | null; nationality: Nationality;
} | null;

export type PlayerRow = {
  id: number; biography_id: number; height_cm: number | null; legacy_summary: string | null;
  career_start_year: number | null; retired_year: number | null;
  is_published: boolean; updated_at: string; person: Person; updated_by_name: string | null;
};

export type PlayerFilters = {
  q?: string; status?: "draft" | "published";
  from?: number; to?: number; heightMin?: number; heightMax?: number; page?: number;
};

const NATIONALITY = "nationality:countries!nationality_id(id, name, demonym, is_historical)";

const COLS =
  `id, biography_id, height_cm, legacy_summary, career_start_year, retired_year, is_published, updated_at, updated_by, person:biographies!inner(id, full_name, display_name, ${NATIONALITY})`;

const first = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] ?? null : v ?? null;

// PostgREST may return embedded rows as an object or a one-item array; normalise both levels
function normPerson(raw: unknown): Person {
  const p = first(raw as Record<string, unknown> | Record<string, unknown>[] | null);
  if (!p) return null;
  return { ...(p as object), nationality: first(p.nationality as Nationality | Nationality[]) } as Person;
}

async function profileNames(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter(Boolean))] as string[];
  if (!unique.length) return new Map<string, string>();
  const { data } = await createAdminClient().from("profiles").select("id, display_name").in("id", unique);
  return new Map((data ?? []).map((p) => [p.id, p.display_name ?? ""]));
}

export async function listPlayers(f: PlayerFilters) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  let q = sb.from("players").select(COLS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (f.q) q = q.ilike("person.full_name", `%${f.q}%`);
  if (f.status) q = q.eq("is_published", f.status === "published");
  if (f.from) q = q.gte("career_start_year", f.from);
  if (f.to) q = q.lte("retired_year", f.to);
  if (f.heightMin) q = q.gte("height_cm", f.heightMin);
  if (f.heightMax) q = q.lte("height_cm", f.heightMax);

  const { data, count, error } = await q;
  if (error) throw fail(error);

  const names = await profileNames((data ?? []).map((r) => r.updated_by));
  const rows: PlayerRow[] = (data ?? []).map((r) => ({
    ...r,
    person: normPerson(r.person),
    updated_by_name: r.updated_by ? names.get(r.updated_by) ?? null : null,
  }));
  return { rows, total: count ?? 0, pageSize: PAGE_SIZE, page };
}

export async function statusCounts() {
  const sb = createAdminClient();
  const head = { count: "exact" as const, head: true };
  const [all, pub] = await Promise.all([
    sb.from("players").select("id", head),
    sb.from("players").select("id", head).eq("is_published", true),
  ]);
  const a = all.count ?? 0, p = pub.count ?? 0;
  return { all: a, published: p, draft: a - p };
}

export async function getPlayer(id: number) {
  const sb = createAdminClient();
  const { data, error } = await sb.from("players")
    .select(`*, person:biographies(id, full_name, display_name, ${NATIONALITY})`)
    .eq("id", id).maybeSingle();
  if (error) throw fail(error);
  if (!data) return null;

  const names = await profileNames([data.created_by, data.updated_by]);
  const head = { count: "exact" as const, head: true };
  const [attrs, hidden, clubStints, natStints, sources] = await Promise.all([
    sb.from("player_attributes").select("player_id", head).eq("player_id", id),
    sb.from("player_hidden_attributes").select("player_id", head).eq("player_id", id),
    sb.from("player_club_stints").select("id", head).eq("player_id", id),
    sb.from("player_national_stints").select("id", head).eq("player_id", id),
    sb.from("biography_sources").select("source_id", head).eq("biography_id", data.biography_id),
  ]);

  return {
    ...data,
    person: normPerson(data.person),
    created_by_name: data.created_by ? names.get(data.created_by) ?? null : null,
    updated_by_name: data.updated_by ? names.get(data.updated_by) ?? null : null,
    hasAttributes: (attrs.count ?? 0) > 0,
    hasHiddenAttributes: (hidden.count ?? 0) > 0,
    clubStintCount: clubStints.count ?? 0,
    nationalStintCount: natStints.count ?? 0,
    sourceCount: sources.count ?? 0,
  };
}

export async function listAvailableBiographies() {
  const sb = createAdminClient();
  const { data: taken, error: e1 } = await sb.from("players").select("biography_id");
  if (e1) throw fail(e1);
  const ids = (taken ?? []).map((r) => r.biography_id);
  let q = sb.from("biographies").select("id, full_name").order("full_name");
  if (ids.length) q = q.not("id", "in", `(${ids.join(",")})`);
  const { data, error } = await q;
  if (error) throw fail(error);
  return data ?? [];
}