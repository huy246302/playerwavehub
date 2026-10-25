"use client";
import { useActionState } from "react";
import Link from "next/link";
import { savePlayerHiddenAttributes } from "@/lib/actions/player-hidden-attributes";
import { HIDDEN_ATTRIBUTE_GROUPS, HIDDEN_ATTRIBUTE_HINTS } from "@/lib/validation/player-hidden-attributes";
import { labelize } from "@/lib/validation/player-attributes";
import type { FormState } from "@/lib/form-state";
import { Card, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

function clampDigits(e: React.FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  el.value = el.value.replace(/[^0-9]/g, "").slice(0, 3);
  if (el.value !== "" && Number(el.value) > 100) el.value = "100";
}

export default function HiddenAttributesForm({
  playerId, attributes, backHref,
}: { playerId: number; attributes: Record<string, number | null> | null; backHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    savePlayerHiddenAttributes.bind(null, playerId), { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string) => state.values?.[k] ?? (attributes?.[k] != null ? String(attributes[k]) : "");

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        <p className="font-medium text-neutral-800">How to rate hidden attributes</p>
        <p className="mt-1">
          Whole numbers from <strong>1 to 100</strong>, or leave a field empty if unknown — every field here is
          optional. These values are never shown on the published player page.
        </p>
      </div>

      {HIDDEN_ATTRIBUTE_GROUPS.map((g) => (
        <Card key={g.title} title={g.title}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {g.fields.map((f) => (
              <div key={f}>
                <label className="mb-1 block text-xs font-medium text-neutral-600">{labelize(f)}</label>
                <input name={f} type="number" min={1} max={100} inputMode="numeric" className={inputCls}
                  defaultValue={val(f)} onInput={clampDigits} />
                {HIDDEN_ATTRIBUTE_HINTS[f] && <p className="mt-1 text-[11px] text-neutral-400">{HIDDEN_ATTRIBUTE_HINTS[f]}</p>}
                {err(f) && <p className="mt-1 text-xs text-red-600">{err(f)}</p>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>All fields optional, 1–100.</span>
        <div className="flex items-center gap-2">
          {state.message && <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>}
          <Link href={backHref} className={ghostBtn}>Back to overview</Link>
          <button disabled={pending} className={primaryBtn}>{pending ? "Saving…" : "Save hidden attributes"}</button>
        </div>
      </div>
    </form>
  );
}