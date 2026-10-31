"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { footSchema } from "@/lib/validation/foot";

export async function savePlayerFoot(
  playerId: number, input: unknown
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireAdmin();
  const parsed = footSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the foot selection." };
  }
  const d = parsed.data;
  // the stronger foot is always 6; two-footed means both are 6
  const left = d.foot === "right" ? d.weaker : 6;
  const right = d.foot === "left" ? d.weaker : 6;

  const { error } = await createAdminClient().from("players").update({
    left_foot_level: left,
    right_foot_level: right,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", playerId);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
  return { ok: true };
}
