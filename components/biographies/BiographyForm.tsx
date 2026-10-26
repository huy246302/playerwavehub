"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createBiography, updateBiography } from "@/lib/actions/biographies";
import type { FormState } from "@/lib/form-state";
import type { Biography } from "@/lib/db/biographies";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";
import DateInput from "@/components/ui/DateInput";

export default function BiographyForm({
  biography, countries,
}: { biography?: Biography | null; countries: { id: number; name: string }[] }) {
  const editing = !!biography;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateBiography.bind(null, biography!.id) : createBiography,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | number | null) =>
    state.values?.[k] ?? (fallback == null ? "" : String(fallback));

  const photoOpen = ["photo_url", "photo_credit", "photo_license", "photo_source_url"].some(
    (k) => val(k, biography?.[k as keyof Biography] as string | null) !== "" || err(k)
  );

  const countrySelect = (name: string, current?: number | null) => (
    <select name={name} defaultValue={val(name, current)} className={inputCls}>
      <option value="">Not set</option>
      {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Identity" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={err("full_name")}>
                <input name="full_name" placeholder="Nguyễn Văn A" className={inputCls}
                  defaultValue={val("full_name", biography?.full_name)} />
              </Field>
              <Field label="Display name" error={err("display_name")}
                hint="The shorter name fans know him by, if different.">
                <input name="display_name" className={inputCls}
                  defaultValue={val("display_name", biography?.display_name)} />
              </Field>
              <Field label="Date of birth" error={err("date_of_birth")}>
                <DateInput name="date_of_birth" defaultValue={val("date_of_birth", biography?.date_of_birth)} />
              </Field>
              <Field label="Date of death" error={err("date_of_death")} hint="Leave empty if still living.">
                <DateInput name="date_of_death" defaultValue={val("date_of_death", biography?.date_of_death)} />
              </Field>
              <Field label="Birthplace" error={err("birthplace")} hint="City or town.">
                <input name="birthplace" className={inputCls}
                  defaultValue={val("birthplace", biography?.birthplace)} />
              </Field>
              <div />
              <Field label="Birth country" error={err("birth_country_id")}>
                {countrySelect("birth_country_id", biography?.birth_country_id)}
              </Field>
              <Field label="Nationality" error={err("nationality_id")}>
                {countrySelect("nationality_id", biography?.nationality_id)}
              </Field>
            </div>
          </Card>

          <Card title="Biography" note="Optional">
            <Field label="Life story" error={err("bio")}>
              <textarea name="bio" rows={8} className={inputCls}
                defaultValue={val("bio", biography?.bio)} />
            </Field>
          </Card>

          <details open={photoOpen} className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
            <summary className="cursor-pointer px-5 py-3 font-serif text-lg text-neutral-900">
              Photo
              <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Optional
              </span>
            </summary>
            <div className="space-y-4 border-t border-neutral-200 p-5">
              <Field label="Photo URL" error={err("photo_url")} hint="Link to an image file. File upload comes later.">
                <input name="photo_url" placeholder="https://…" className={inputCls}
                  defaultValue={val("photo_url", biography?.photo_url)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Photo credit" error={err("photo_credit")}>
                  <input name="photo_credit" className={inputCls}
                    defaultValue={val("photo_credit", biography?.photo_credit)} />
                </Field>
                <Field label="License" error={err("photo_license")} hint="For example CC BY-SA 4.0.">
                  <input name="photo_license" className={inputCls}
                    defaultValue={val("photo_license", biography?.photo_license)} />
                </Field>
              </div>
              <Field label="Source page URL" error={err("photo_source_url")} hint="The page the image came from.">
                <input name="photo_source_url" placeholder="https://…" className={inputCls}
                  defaultValue={val("photo_source_url", biography?.photo_source_url)} />
              </Field>
            </div>
          </details>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Only the full name is required.</li>
              <li>A biography becomes a player or head coach by linking a record to it.</li>
              <li>The slug is generated from the name and stays the same after edits.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [["Record ID", biography!.id], ["Slug", biography!.slug],
                   ["Created", fmtDateTime(biography!.created_at)],
                   ["Last updated", fmtDateTime(biography!.updated_at)]]
                : [["Record ID", "Generated on save"], ["Slug", "Generated from the name"]]
            } />
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>* Required field</span>
        <div className="flex items-center gap-2">
          {state.message && <span className="text-sm text-red-600">{state.message}</span>}
          <Link href={editing ? `/biographies/${biography!.id}` : "/biographies"} className={ghostBtn}>
            Cancel
          </Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save biography"}
          </button>
        </div>
      </div>
    </form>
  );
}