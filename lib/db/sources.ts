import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { by, resolveSort, type SortMap } from "@/lib/db/sort";
import { fail, PAGE_SIZE } from "@/lib/db/util";

export type Source = {
  id: number; title: string; url: string | null; publisher: string | null; author: string | null;
  published_on: string | null; accessed_on: string | null; notes: string | null; created_at: string;
};

export const SOURCE_SORTS: SortMap = {
  created_desc: by("Newest added", ["created_at", "desc"], ["id", "desc"]),
  created_asc: by("Oldest added", ["created_at", "asc"], ["id", "asc"]),
  title_asc: by("Title A–Z", ["title", "asc"], ["id", "asc"]),
  title_desc: by("Title Z–A", ["title", "desc"], ["id", "desc"]),
  published_desc: by("Published: newest first", ["published_on", "desc"], ["id", "desc"]),
  published_asc: by("Published: oldest first", ["published_on", "asc"], ["id", "asc"]),
};

export async function listSources(f: {
  q?: string; page?: number; publisher?: string; fromYear?: number; toYear?: number; sort?: string;
}) {
  const sb = createAdminClient();
  const page = f.page && f.page > 0 ? f.page : 1;

  const { order } = resolveSort(f.sort, SOURCE_SORTS, "created_desc");
  let q = sb.from("sources").select("*", { count: "exact" })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  for (const o of order) q = q.order(o.column, { ascending: o.ascending, nullsFirst: false });

  const term = f.q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) q = q.or(`title.ilike.%${term}%,publisher.ilike.%${term}%,author.ilike.%${term}%`);
  const publisher = f.publisher?.replace(/[%*\\]/g, " ").trim();
  if (publisher) q = q.ilike("publisher", `%${publisher}%`);
  if (f.fromYear) q = q.gte("published_on", `${f.fromYear}-01-01`);
  if (f.toYear) q = q.lte("published_on", `${f.toYear}-12-31`);

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