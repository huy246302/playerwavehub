import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type Person = { full_name: string; display_name: string | null } | null;
const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

export type PlayerRow = {
  id: number; person_id: number; height_cm: number | null; legacy_summary: string | null;
  career_start_year: number | null; retired_year: number | null;
  is_published: boolean; updated_at: string; person: Person;
};

export type PlayerFilters = {
  q?: string; status?: "draft" | "published";
  from?: number; to?: number; page?: number; pageSize?: number;
};

const COLS =
  "id, person_id, height_cm, legacy_summary, career_start_year, retired_year, is_published, updated_at, person:people!inner(full_name, display_name)";

export async function listPlayers(f: PlayerFilters) {
  const sb = createAdminClient();
  const size = f.pageSize ?? 25;
  const page = f.page ?? 1;

  let q = sb.from("players").select(COLS, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);

  if (f.q) q = q.ilike("people.full_name", `%${f.q}%`);
  if (f.status) q = q.eq("is_published", f.status === "published");
  if (f.from) q = q.gte("career_start_year", f.from);
  if (f.to) q = q.lte("retired_year", f.to);

  const { data, count, error } = await q;
  if (error) throw error;

  const rows: PlayerRow[] = (data ?? []).map((r) => ({
    ...r,
    person: one(r.person as Person | Person[]),
  }));
  return { rows, total: count ?? 0, pageSize: size };
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
    .select("*, person:people(full_name, display_name)").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const ids = [data.created_by, data.updated_by].filter(Boolean) as string[];
  let profs: { id: string; display_name: string | null }[] = [];
  if (ids.length) {
    const { data: p } = await sb.from("profiles").select("id, display_name").in("id", ids);
    profs = p ?? [];
  }
  const name = (u: string | null) => profs.find((x) => x.id === u)?.display_name ?? null;

  return {
    ...data,
    person: one(data.person as Person | Person[]),
    created_by_name: name(data.created_by),
    updated_by_name: name(data.updated_by),
  };
}

export async function listAvailablePeople() {
  const sb = createAdminClient();
  const { data: taken } = await sb.from("players").select("person_id");
  const ids = (taken ?? []).map((r) => r.person_id);
  let q = sb.from("people").select("id, full_name").order("full_name");
  if (ids.length) q = q.not("id", "in", `(${ids.join(",")})`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}