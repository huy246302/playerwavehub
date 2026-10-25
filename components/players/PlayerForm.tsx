"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createPlayer, updatePlayer } from "@/lib/actions/players";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type Player = {
  id: number; biography_id: number; career_start_year: number | null; retired_year: number | null;
  height_cm: number | null; legacy_summary: string | null; is_published: boolean; created_at: string;
  person: { id: number; full_name: string } | null;
  created_by_name: string | null; updated_by_name: string | null;
};

export default function PlayerForm({
  player, biographies,
}: { player?: Player | null; biographies: { id: number; full_name: string }[] }) {
  const editing = !!player;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updatePlayer.bind(null, player!.id) : createPlayer,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";
  const biographyId = state.values?.biography_id ?? (player?.biography_id ? String(player.biography_id) : "");
  const status = state.values?.status ?? (player?.is_published ? "published" : "draft");

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Linked biography" note="Required">
            {editing ? (
              <>
                <input type="hidden" name="biography_id" value={player!.biography_id} />
                <div className={`${inputCls} bg-neutral-100`}>{player!.person?.full_name}</div>
                <p className="mt-1 text-xs text-neutral-400">The linked biography cannot be changed after saving.</p>
              </>
            ) : (
              <>
                <Field label="Linked biography" required error={err("biography_id")}>
                  <select name="biography_id" defaultValue={biographyId} className={inputCls}>
                    <option value="">{biographies.length ? "Select an eligible biography…" : "No eligible biographies"}</option>
                    {biographies.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </Field>
                <p className="mt-1 text-xs text-neutral-400">
                  Choose a biography without an existing player record. One record per biography per role.
                </p>
                <Link href="/biographies/new" target="_blank" rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-[#254a39] underline">
                  + Create biography
                </Link>
              </>
            )}
          </Card>

          <Card title="Career & legacy" note="Optional">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Career start year" error={err("career_start_year")}>
                <input name="career_start_year" inputMode="numeric" placeholder="YYYY" className={inputCls}
                  defaultValue={val("career_start_year", player?.career_start_year ? String(player.career_start_year) : undefined)} />
              </Field>
              <Field label="Retired year" error={err("retired_year")}>
                <input name="retired_year" inputMode="numeric" placeholder="YYYY" className={inputCls}
                  defaultValue={val("retired_year", player?.retired_year ? String(player.retired_year) : undefined)} />
              </Field>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Use four-digit years. Retired year must be equal to or later than career start year when both are entered.
            </p>
            <div className="mt-4">
              <Field label="Height (cm)" error={err("height_cm")} hint="Optional · Enter a value from 120 to 230 cm.">
                <input name="height_cm" inputMode="numeric" placeholder="Enter height" className={inputCls}
                  defaultValue={val("height_cm", player?.height_cm ? String(player.height_cm) : undefined)} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Legacy summary" error={err("legacy_summary")} hint="Optional · Keep the story concise and grounded in sources.">
                <textarea name="legacy_summary" rows={4} placeholder="Summarise this player's contribution to the game…"
                  className={inputCls} defaultValue={val("legacy_summary", player?.legacy_summary)} />
              </Field>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publication">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              {editing ? "Current status" : "New record"}
            </p>
            <label className={`mb-2 flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${status === "draft" ? "border-[#254a39] bg-[#eef3ef]" : "border-neutral-200"}`}>
              <input type="radio" name="status" value="draft" defaultChecked={status === "draft"} className="mt-0.5" />
              <span><span className="font-medium">Draft</span><br /><span className="text-neutral-500">Keep unpublished while you work.</span></span>
            </label>
            <label className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${status === "published" ? "border-[#254a39] bg-[#eef3ef]" : "border-neutral-200"}`}>
              <input type="radio" name="status" value="published" defaultChecked={status === "published"} className="mt-0.5" />
              <span><span className="font-medium">Publish</span><br /><span className="text-neutral-500">Publish when this record is ready.</span></span>
            </label>
            {err("status") && <p className="mt-2 text-xs text-red-600">{err("status")}</p>}
            {!editing && <p className="mt-2 text-xs text-neutral-400">Draft is selected by default. The selected status is applied when you save.</p>}
          </Card>

          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Only the linked biography is required. Career years, height and the legacy summary can be added later.</li>
              <li>Related records and attributes stay separate from the core record.</li>
              <li>Publishing requires a full attributes record.</li>
            </ul>
          </Card>

          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [
                    ["Record ID", player!.id],
                    ["Created by", player!.created_by_name ?? "—"],
                    ["Updated by", player!.updated_by_name ?? "—"],
                    ["Created", fmtDateTime(player!.created_at)],
                  ]
                : [["Record ID", "Generated on save"], ["Created by, updated by", "Set by the system after saving"]]
            } />
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>* Required field</span>
        <div className="flex items-center gap-2">
          {state.message && <span className="text-sm text-red-600">{state.message}</span>}
          <Link href={editing ? `/players/${player!.id}` : "/players"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save draft"}
          </button>
        </div>
      </div>
    </form>
  );
}