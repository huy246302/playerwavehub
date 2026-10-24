"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createNationalTeam, updateNationalTeam } from "@/lib/actions/national-teams";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type Team = {
  id: number; slug: string; name: string; crest_url: string | null; description: string | null;
  country: { id: number; name: string } | null; created_at: string;
  created_by_name: string | null; updated_by_name: string | null;
};

export default function NationalTeamForm({
  team, countries,
}: { team?: Team | null; countries: { id: number; name: string }[] }) {
  const editing = !!team;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateNationalTeam.bind(null, team!.id) : createNationalTeam,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";
  const countryId = state.values?.country_id ?? (team?.country ? String(team.country.id) : "");

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="National team" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={err("name")}>
                <input name="name" placeholder="Vietnam" className={inputCls} defaultValue={val("name", team?.name)} />
              </Field>
              <div>
                <Field label="Country" required error={err("country_id")}>
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
            </div>
          </Card>

          <Card title="Crest" note="Optional">
            <Field label="Crest image URL" error={err("crest_url")} hint="Link to an image file. File upload comes later.">
              <input name="crest_url" placeholder="https://…" className={inputCls} defaultValue={val("crest_url", team?.crest_url)} />
            </Field>
          </Card>

          <Card title="Description" note="Optional">
            <textarea name="description" rows={5} placeholder="History, honours, era notes…"
              className={inputCls} defaultValue={val("description", team?.description)} />
            {err("description") && <p className="mt-1 text-xs text-red-600">{err("description")}</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Name and country are required.</li>
              <li>This covers one level only — no age-group teams.</li>
              <li>The slug is generated from the name and stays the same after edits.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [
                    ["Record ID", team!.id], ["Slug", team!.slug],
                    ["Created by", team!.created_by_name ?? "—"],
                    ["Updated by", team!.updated_by_name ?? "—"],
                    ["Created", fmtDateTime(team!.created_at)],
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
          <Link href={editing ? `/national-teams/${team!.id}` : "/national-teams"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save national team"}
          </button>
        </div>
      </div>
    </form>
  );
}