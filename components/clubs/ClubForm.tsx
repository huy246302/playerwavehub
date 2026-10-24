"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createClub, updateClub } from "@/lib/actions/clubs";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type Club = {
  id: number; slug: string; name: string; short_name: string | null; city: string | null;
  founded_year: number | null; logo_url: string | null; logo_credit: string | null;
  logo_license: string | null; logo_source_url: string | null; description: string | null;
  country: { id: number; name: string } | null; created_at: string;
  created_by_name: string | null; updated_by_name: string | null;
};

export default function ClubForm({
  club, countries,
}: { club?: Club | null; countries: { id: number; name: string }[] }) {
  const editing = !!club;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateClub.bind(null, club!.id) : createClub,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";
  const countryId = state.values?.country_id ?? (club?.country ? String(club.country.id) : "");

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Club" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={err("name")}>
                <input name="name" placeholder="Thể Công" className={inputCls} defaultValue={val("name", club?.name)} />
              </Field>
              <Field label="Short name" error={err("short_name")}>
                <input name="short_name" placeholder="TC" className={inputCls} defaultValue={val("short_name", club?.short_name)} />
              </Field>
              <Field label="City" error={err("city")}>
                <input name="city" placeholder="Hanoi" className={inputCls} defaultValue={val("city", club?.city)} />
              </Field>
              <Field label="Founded year" error={err("founded_year")} hint="Four digits">
                <input name="founded_year" inputMode="numeric" placeholder="YYYY" className={inputCls}
                  defaultValue={val("founded_year", club?.founded_year ? String(club.founded_year) : undefined)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Country" error={err("country_id")}>
                <select name="country_id" defaultValue={countryId} className={inputCls}>
                  <option value="">{countries.length ? "Select a country…" : "No countries added yet"}</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Link href="/countries/new" target="_blank" rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-[#254a39] underline">
                + Add country
              </Link>
            </div>
          </Card>

          <Card title="Logo" note="Optional">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Logo image URL" error={err("logo_url")}>
                  <input name="logo_url" placeholder="https://…" className={inputCls} defaultValue={val("logo_url", club?.logo_url)} />
                </Field>
              </div>
              <Field label="Credit" error={err("logo_credit")}>
                <input name="logo_credit" placeholder="Who made or took it" className={inputCls} defaultValue={val("logo_credit", club?.logo_credit)} />
              </Field>
              <Field label="License" error={err("logo_license")}>
                <input name="logo_license" placeholder="e.g. CC BY-SA 4.0" className={inputCls} defaultValue={val("logo_license", club?.logo_license)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Source URL" error={err("logo_source_url")}>
                  <input name="logo_source_url" placeholder="Page the image came from" className={inputCls} defaultValue={val("logo_source_url", club?.logo_source_url)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Description" note="Optional">
            <textarea name="description" rows={5} placeholder="Club history, identity, honours…"
              className={inputCls} defaultValue={val("description", club?.description)} />
            {err("description") && <p className="mt-1 text-xs text-red-600">{err("description")}</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Only the name is required.</li>
              <li>The slug is generated from the name and stays the same after edits.</li>
              <li>Logo files aren&apos;t uploaded yet — paste a link for now.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [
                    ["Record ID", club!.id], ["Slug", club!.slug],
                    ["Created by", club!.created_by_name ?? "—"],
                    ["Updated by", club!.updated_by_name ?? "—"],
                    ["Created", fmtDateTime(club!.created_at)],
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
          <Link href={editing ? `/clubs/${club!.id}` : "/clubs"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save club"}
          </button>
        </div>
      </div>
    </form>
  );
}