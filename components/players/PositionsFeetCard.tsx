"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { savePlayerPosition, deletePlayerPosition } from "@/lib/actions/player-positions";
import { POSITION_CODES } from "@/lib/validation/position";
import type { PlayerPosition } from "@/lib/db/player-positions";
import type { PlayerFeet } from "@/lib/db/player-feet";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

function AddPositionForm({
  playerId, taken, onDone,
}: { playerId: number; taken: string[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    savePlayerPosition.bind(null, playerId), { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const available = POSITION_CODES.filter((p) => !taken.includes(p));
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Position</label>
        <select name="position" defaultValue="" className={`${inputCls} w-28`}>
          <option value="" disabled>{available.length ? "Select…" : "All added"}</option>
          {available.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {err("position") && <p className="mt-1 text-xs text-red-600">{err("position")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Rating</label>
        <input name="rating" type="number" min={1} max={100} className={`${inputCls} w-20`} />
        {err("rating") && <p className="mt-1 text-xs text-red-600">{err("rating")}</p>}
      </div>
      <label className="mb-2 flex items-center gap-1.5 text-sm text-neutral-600">
        <input type="checkbox" name="is_primary" /> Primary
      </label>
      <button disabled={pending || !available.length} className={primaryBtn}>{pending ? "Adding…" : "Add position"}</button>
      {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
    </form>
  );
}

function PositionRow({
  playerId, pos, onChanged,
}: { playerId: number; pos: PlayerPosition; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
      <span>
        <span className="font-medium">{pos.position}</span>
        <span className="ml-2 text-neutral-500">Rating {pos.rating}</span>
        {pos.is_primary && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Primary</span>}
      </span>
      <button type="button" disabled={busy} className="text-xs text-red-700 underline disabled:opacity-50"
        onClick={async () => {
          if (!confirm(`Remove position ${pos.position}?`)) return;
          setBusy(true);
          const res = await deletePlayerPosition(playerId, pos.position);
          setBusy(false);
          if (!res.ok) { alert(res.message ?? "Could not delete."); return; }
          onChanged();
        }}>
        {busy ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}

export default function PositionsFeetCard({
  playerId, positions, feet,
}: { playerId: number; positions: PlayerPosition[]; feet: PlayerFeet | null }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const refresh = () => { setAdding(false); router.refresh(); };

  return (
    <Card title="Positions & foot" note={positions.length ? `${positions.length} position(s)` : "No selection made"}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Foot</p>
          {feet ? (
            <>
              <p className="mb-3 text-sm text-neutral-800">
                {feet.preferred_foot === "both"
                  ? "Two-footed — left and right are rated equally strong."
                  : `${feet.preferred_foot === "left" ? "Left" : "Right"}-footed — ${
                      feet.preferred_foot === "left" ? feet.left_foot_label : feet.right_foot_label
                    } on the ${feet.preferred_foot} foot, ${
                      feet.preferred_foot === "left" ? feet.right_foot_label : feet.left_foot_label
                    } on the other.`}
              </p>
              <DefList rows={[
                ["Left foot rating", `Level ${feet.left_foot_level}/5 — ${feet.left_foot_label}`],
                ["Right foot rating", `Level ${feet.right_foot_level}/5 — ${feet.right_foot_label}`],
                ["Weaker side", feet.weak_foot_label],
              ]} />
            </>
          ) : (
            <p className="text-sm text-neutral-500">Add player attributes first — foot levels are calculated from left/right foot ratings.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Positions</p>
          {positions.length === 0 && <p className="mb-2 text-sm text-neutral-500">No positions added yet.</p>}
          <div className="space-y-2">
            {positions.map((p) => <PositionRow key={p.position} playerId={playerId} pos={p} onChanged={refresh} />)}
          </div>
          <div className="mt-3">
            {adding ? (
              <AddPositionForm playerId={playerId} taken={positions.map((p) => p.position)} onDone={refresh} />
            ) : (
              <button type="button" onClick={() => setAdding(true)} className={ghostBtn}>+ Add position</button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}