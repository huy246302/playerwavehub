import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type PersonInput = {
  full_name: string;
  display_name?: string;
  date_of_birth?: string;
  date_of_death?: string;
  birthplace?: string;
  bio?: string;
};

export async function insertPerson(
  input: PersonInput,
  userId: string
): Promise<{ id?: number; error?: string }> {
  const sb = createAdminClient();
  const base = slugify(input.full_name) || "person";

  // slug is UNIQUE: retry with a random suffix on conflict
  for (let i = 0; i < 3; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await sb
      .from("biographies")
      .insert({
        slug,
        full_name: input.full_name,
        display_name: input.display_name ?? null,
        date_of_birth: input.date_of_birth ?? null,
        date_of_death: input.date_of_death ?? null,
        birthplace: input.birthplace ?? null,
        bio: input.bio ?? null,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();
    if (!error) return { id: data.id };
    if (error.code !== "23505") return { error: error.message };
  }
  return { error: "Could not generate a unique slug." };
}