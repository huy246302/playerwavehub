import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, PAGE_SIZE } from "@/lib/db/util";

export type Source = {
  id: number; title: string; url: string | null; publisher: string | null; author: string | null;
  published_on: string | null; accessed_on: string | null; notes: string | null; created_at: string;
};

export async function listSources(f: { q?: string; page?: number }) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  let q = sb.from("sources").select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (f.q) q = q.or(`title.ilike.%${f.q}%,publisher.ilike.%${f.q}%,author.ilike.%${f.q}%`);

  const { data, count, error } = await q;
  if (error) throw fail(error);
  return { rows: (data ?? []) as Source[], total: count ?? 0, pageSize: PAGE_SIZE, page };
}

export async function getSource(id: number) {
  const sb = createAdminClient();
  const { data, error } = await sb.from("sources").select("*").eq("id", id).maybeSingle();
  if (error) throw fail(error);
  if (!data) return null;

  const head = { count: "exact" as const, head: true };
  const [bioLinks, clubLinks] = await Promise.all([
    sb.from("biography_sources").select("biography_id", head).eq("source_id", id),
    sb.from("club_sources").select("club_id", head).eq("source_id", id),
  ]);

  return { ...(data as Source), usage: { biographies: bioLinks.count ?? 0, clubs: clubLinks.count ?? 0 } };
}

export async function listSourceOptions() {
  const { data, error } = await createAdminClient().from("sources").select("id, title").order("title");
  if (error) throw fail(error);
  return (data ?? []) as { id: number; title: string }[];
}