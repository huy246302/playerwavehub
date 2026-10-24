"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertWithSlug } from "@/lib/slug";
import { countrySchema } from "@/lib/validation/country";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

function dbError(
  error: { message: string; code?: string; details?: string },
  fd: FormData
): FormState {
  if (error.code === "23505" && (error.details ?? "").includes("iso_code")) {
    return {
      ok: false,
      errors: { iso_code: ["That ISO code is already used by another country."] },
      values: formValues(fd),
    };
  }
  return { ok: false, message: error.message, values: formValues(fd) };
}

export async function createCountry(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = countrySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { id, error } = await insertWithSlug("countries", d.name, {
    name: d.name,
    iso_code: d.iso_code ?? null,
    flag_url: d.flag_url ?? null,
    is_historical: d.is_historical,
  });
  if (error) return dbError(error, fd);

  revalidatePath("/", "layout");
  redirect(`/countries/${id}`);
}

export async function updateCountry(id: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = countrySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { error } = await createAdminClient().from("countries").update({
    name: d.name,
    iso_code: d.iso_code ?? null,
    flag_url: d.flag_url ?? null,
    is_historical: d.is_historical,
  }).eq("id", id);
  if (error) return dbError(error, fd);

  revalidatePath("/", "layout");
  redirect(`/countries/${id}`);
}

export async function deleteCountries(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("countries").delete().in("id", ids);
  if (error?.code === "23503") {
    return {
      ok: false,
      message: "This country is still used by a club, national team or biography. Remove those links first.",
    };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}