import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, one } from "@/lib/db/util";

type SourceRef = { id: number; title: string; url: string | null; publisher: string | null } | null;

export async function listClubSources(clubId: number) {
  const { data, error } = await createAdminClient()
    .from("club_sources")
    .select("source_id, note, source:sources(id, title, url, publisher)")
    .eq("club_id", clubId);
  if (error) throw fail(error);
  return (data ?? []).map((r) => ({ ...r, source: one(r.source as SourceRef | SourceRef[]) }));
}