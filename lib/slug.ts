import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type DbError = { message: string; code?: string; details?: string };

// Insert a row with a slug generated from `name`; retries with a random suffix on a slug clash.
export async function insertWithSlug(
  table: "countries" | "clubs",
  name: string,
  row: Record<string, unknown>
): Promise<{ id?: number; error?: DbError }> {
  const sb = createAdminClient();
  const base = slugify(name) || table.slice(0, -1);

  for (let i = 0; i < 3; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await sb.from(table).insert({ ...row, slug }).select("id").single();
    if (!error) return { id: data.id };
    const slugClash = error.code === "23505" && (error.details ?? "").includes("slug");
    if (!slugClash) return { error };
  }
  return { error: { message: "Could not generate a unique slug." } };
}