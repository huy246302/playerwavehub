"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createFederation, updateFederation } from "@/lib/actions/federations";
import { CONFEDERATIONS } from "@/lib/validation/federation";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type Federation = {
  id: number; slug: string; name: string; short_name: string | null;
  confederation: string | null; founded_year: number; ended_year: number | null;
  logo_url: string | null; logo_credit: string | null; logo_license: string | null;
  logo_source_url: string | null; description: string | null;
  country: { id: number; name: string } | null; created_at: string;
  created_by_name: string | null; updated_by_name: string | null;
};

export default function FederationForm({
  federation, countries,
}: { federation?: Federation | null; countries: { id: number; name: string; is_historical?: boolean }[] }) {
  const router = useRouter();
  const editing = !!federation;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateFederation.bind(null, federation!.id) : createFederation,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";
  const countryId = state.values?.country_id ?? (federation?.country ? String(federation.country.id) : "");

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Federation" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={err("name")}>
                <input name="name" placeholder="Vietnam Football Federation" className={inputCls}
                  defaultValue={val("name", federation?.name)} />
              </Field>
              <Field label="Short name" error={err("short_name")}>
                <input name="short_name" placeholder="VFF" className={inputCls}
                  defaultValue={val("short_name", federation?.short_name)} />
              </Field>
              <Field label="Founded year" required error={err("founded_year")} hint="Four digits, up to this year">
                <input name="founded_year" inputMode="numeric" placeholder="YYYY" className={inputCls}
                  defaultValue={val("founded_year", federation ? String(federation.founded_year) : undefined)} />
              </Field>
              <Field label="Ended year" error={err("ended_year")} hint="Leave empty if it still exists">
                <input name="ended_year" inputMode="numeric" placeholder="YYYY" className={inputCls}
                  defaultValue={val("ended_year", federation?.ended_year ? String(federation.ended_year) : undefined)} />
              </Field>
              <Field label="Confederation" error={err("confederation")}>
                <select name="confederation" className={inputCls}
                  defaultValue={val("confederation", federation?.confederation)}>
                  <option value="">None / unknown</option>
                  {CONFEDERATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Country" required error={err("country_id")}>
                <select name="country_id" defaultValue={countryId} className={inputCls}>
                  <option value="">{countries.length ? "Select a country…" : "No countries added yet"}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.is_historical ? " (historical)" : ""}</option>
                  ))}
                </select>
              </Field>
              <Link href="/countries/new" target="_blank" rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-[#254a39] underline">
                + Add country
              </Link>
              <button type="button" onClick={() => router.refresh()}
                className="ml-3 mt-1 text-xs text-[#254a39] underline">
                Refresh list
              </button>
            </div>
          </Card>

          <Card title="Logo" note="Optional">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Logo image URL" error={err("logo_url")}>
                  <input name="logo_url" placeholder="https://…" className={inputCls}
                    defaultValue={val("logo_url", federation?.logo_url)} />
                </Field>
              </div>
              <Field label="Credit" error={err("logo_credit")}>
                <input name="logo_credit" placeholder="Who made or took it" className={inputCls}
                  defaultValue={val("logo_credit", federation?.logo_credit)} />
              </Field>
              <Field label="License" error={err("logo_license")}>
                <input name="logo_license" placeholder="e.g. CC BY-SA 4.0" className={inputCls}
                  defaultValue={val("logo_license", federation?.logo_license)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Source URL" error={err("logo_source_url")}>
                  <input name="logo_source_url" placeholder="Page the image came from" className={inputCls}
                    defaultValue={val("logo_source_url", federation?.logo_source_url)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Description" note="Optional">
            <textarea name="description" rows={5} placeholder="History of the federation, its predecessors and successors…"
              className={inputCls} defaultValue={val("description", federation?.description)} />
            {err("description") && <p className="mt-1 text-xs text-red-600">{err("description")}</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Name, country and founded year are required.</li>
              <li>If the federation was dissolved or replaced, fill in the ended year. A successor federation is a new record.</li>
              <li>National teams take their dates from their federation.</li>
              <li>The slug is generated from the name and stays the same after edits.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [
                    ["Record ID", federation!.id], ["Slug", federation!.slug],
                    ["Created by", federation!.created_by_name ?? "—"],
                    ["Updated by", federation!.updated_by_name ?? "—"],
                    ["Created", fmtDateTime(federation!.created_at)],
                  ]
                : [["Record ID", "Generated on save"], ["Slug", "Generated from the name"]]
            } />
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>* Required field</span>
        <div className="flex items-center gap-2">
          {state.message && <span className="text-sm text-red-600">{state.message}</span>}
          <Link href={editing ? `/federations/${federation!.id}` : "/federations"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save federation"}
          </button>
        </div>
      </div>
    </form>
  );
}
