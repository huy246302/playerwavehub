"use client";
import { useActionState } from "react";
import Link from "next/link";
import { savePlayerAttributes } from "@/lib/actions/player-attributes";
import {
  ATTRIBUTE_GROUPS, autoFillFields, labelize, type PlayerKind,
} from "@/lib/validation/player-attributes";
import type { FormState } from "@/lib/form-state";
import { Card, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

export default function AttributesForm({
  playerId, attributes, backHref, kind,
}: { playerId: number; attributes: Record<string, number> | null; backHref: string; kind: PlayerKind | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    savePlayerAttributes.bind(null, playerId), { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const auto = new Set(autoFillFields(kind));
  const val = (k: string) => state.values?.[k] ?? (attributes?.[k] != null ? String(attributes[k]) : "");

  return (
    <form action={action} className="space-y-6">
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
      <p className="font-medium text-neutral-800">How to rate each attribute</p>
      <p className="mt-1">
        Whole numbers from <strong>1 to 100</strong> only — no decimals, no letters. Higher means stronger in that
        attribute, except where noted. Every field is required before this player can be published.
      </p>
    </div>

    {kind === "outfield" && (
      <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <strong>Outfield player.</strong> Leave a Goalkeeping field empty and it is saved as 1.
      </div>
    )}
    {kind === "goalkeeper" && (
      <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        <strong>Goalkeeper.</strong> Leave an outfield field marked <em>auto 1</em> empty and it is saved as 1.
        The other outfield fields also matter for goalkeepers, so fill those in.
      </div>
    )}
    {kind === null && (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Set this player&apos;s primary position first (Positions card above) and empty fields that do not apply
        will be filled with 1 automatically. Until then, every field is required.
      </div>
    )}
    {!attributes && (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No attributes are saved yet. Fill in the required fields and save to create this player&apos;s attributes record — required before publishing.
      </div>
    )}
      {ATTRIBUTE_GROUPS.map((g) => (
        <Card key={g.title} title={g.title}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.fields.map((f) => (
              <div key={f}>
                <label className="mb-1 block text-xs font-medium text-neutral-600">
                  {labelize(f)}
                  {auto.has(f) && <span className="ml-1.5 rounded bg-neutral-200 px-1 py-px text-[10px] font-normal text-neutral-600">auto 1</span>}
                </label>
                <input
                  key={`${f}-${attributes?.[f] ?? ""}`}
                  name={f}
                  placeholder={auto.has(f) ? "1" : undefined}
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  maxLength={3}
                  className={inputCls}
                  defaultValue={val(f)}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.value = el.value.replace(/[^0-9]/g, "").slice(0, 3);
                    if (el.value !== "" && Number(el.value) > 100) el.value = "100";
                  }}
                />
                {err(f) && <p className="mt-1 text-xs text-red-600">{err(f)}</p>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>
          {kind ? "Fields marked auto 1 can be left empty. All others are required, 1–100." : "Every field is required, 1–100."}
        </span>
        <div className="flex items-center gap-2">
          {state.message && <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>}
          <Link href={backHref} className={ghostBtn}>Back to overview</Link>
          <button disabled={pending} className={primaryBtn}>{pending ? "Saving…" : "Save attributes"}</button>
        </div>
      </div>
    </form>
  );
}