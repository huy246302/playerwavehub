"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createCountry, updateCountry } from "@/lib/actions/countries";
import type { FormState } from "@/lib/form-state";
import type { Country } from "@/lib/db/countries";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

export default function CountryForm({ country }: { country?: Country | null }) {
  const editing = !!country;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateCountry.bind(null, country!.id) : createCountry,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";
  const historical = state.values
    ? state.values.is_historical === "on"
    : (country?.is_historical ?? false);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Country" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={err("name")}>
                <input name="name" placeholder="Việt Nam" className={inputCls}
                  defaultValue={val("name", country?.name)} />
              </Field>
              <Field label="ISO code" error={err("iso_code")}
                hint="2 letters, for example VN. Leave empty for historical states.">
                <input name="iso_code" maxLength={2} placeholder="VN" className={`${inputCls} uppercase`}
                  defaultValue={val("iso_code", country?.iso_code)} />
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="is_historical" defaultChecked={historical} />
              Historical state (for example South Vietnam, USSR, Yugoslavia)
            </label>
          </Card>

          <Card title="Flag" note="Optional">
            <Field label="Flag image URL" error={err("flag_url")}
              hint="Link to an image file. File upload comes later.">
              <input name="flag_url" placeholder="https://…" className={inputCls}
                defaultValue={val("flag_url", country?.flag_url)} />
            </Field>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Only the name is required.</li>
              <li>Each ISO code can be used once.</li>
              <li>The slug is generated from the name and stays the same after edits.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [["Record ID", country!.id], ["Slug", country!.slug], ["Created", fmtDateTime(country!.created_at)]]
                : [["Record ID", "Generated on save"], ["Slug", "Generated from the name"]]
            } />
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>* Required field</span>
        <div className="flex items-center gap-2">
          {state.message && <span className="text-sm text-red-600">{state.message}</span>}
          <Link href={editing ? `/countries/${country!.id}` : "/countries"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save country"}
          </button>
        </div>
      </div>
    </form>
  );
}