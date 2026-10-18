// lib/db/players.ts
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlayerFilters = {
  q?: string; status?: "draft" | "published";
  from?: number; to?: number; page?: number; pageSize?: number;
};

export async function listPlayers(f: PlayerFilters) {
  const sb = createAdminClient(); // admin client: drafts must be visible here
  const size = f.pageSize ?? 25;
  const page = f.page ?? 1;

  let q = sb
    .from("players")
    .select(
      "id, person_id, height_cm, legacy_summary, career_start_year, retired_year, is_published, updated_at, person:people!inner(full_name, display_name)",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);

  if (f.q) q = q.ilike("people.full_name", `%${f.q}%`);
  if (f.status) q = q.eq("is_published", f.status === "published");
  if (f.from) q = q.gte("career_start_year", f.from);
  if (f.to) q = q.lte("retired_year", f.to);

  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
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