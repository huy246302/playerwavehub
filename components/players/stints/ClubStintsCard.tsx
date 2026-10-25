"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClubStint, updateClubStint, deleteClubStint } from "@/lib/actions/player-stints";
import type { ClubStint } from "@/lib/db/player-stints";
import type { FormState } from "@/lib/form-state";
import { Card, clampDigits , ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

function StintFields({ state, defaults }: { state: FormState; defaults?: Partial<ClubStint> }) {
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string) => state.values?.[k] ?? fallback ?? "";
  const currentYear = new Date().getFullYear();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Start year *</label>
        <input name="start_year" type="number" inputMode="numeric" min={1800} max={currentYear} placeholder="YYYY"
          className={inputCls} onInput={clampDigits(4, currentYear)}
          defaultValue={val("start_year", defaults?.start_year ? String(defaults.start_year) : undefined)} />
        {err("start_year") && <p className="mt-1 text-xs text-red-600">{err("start_year")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">End year</label>
        <input name="end_year" type="number" inputMode="numeric" min={1800} max={currentYear} placeholder="YYYY · optional"
          className={inputCls} onInput={clampDigits(4, currentYear)}
          defaultValue={val("end_year", defaults?.end_year ? String(defaults.end_year) : undefined)} />
        {err("end_year") && <p className="mt-1 text-xs text-red-600">{err("end_year")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Appearances</label>
        <input name="appearances" type="number" inputMode="numeric" min={0} className={inputCls}
          onInput={clampDigits(4, 9999)}
          defaultValue={val("appearances", defaults?.appearances != null ? String(defaults.appearances) : undefined)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Goals</label>
        <input name="goals" type="number" inputMode="numeric" min={0} className={inputCls}
          onInput={clampDigits(4, 9999)}
          defaultValue={val("goals", defaults?.goals != null ? String(defaults.goals) : undefined)} />
      </div>
      <label className="col-span-2 flex items-center gap-1.5 text-sm text-neutral-600">
        <input type="checkbox" name="is_loan" defaultChecked={defaults?.is_loan} /> On loan
      </label>
    </div>
  );
}
function AddClubStintForm({
  playerId, clubs, onDone,
}: { playerId: number; clubs: { id: number; name: string }[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createClubStint.bind(null, playerId), { ok: false });
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Club *</label>
        <select name="club_id" defaultValue="" className={inputCls}>
          <option value="">{clubs.length ? "Select a club…" : "No clubs added yet"}</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {err("club_id") && <p className="mt-1 text-xs text-red-600">{err("club_id")}</p>}
        <Link href="/clubs/new" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#254a39] underline">
          + Add club
        </Link>
      </div>
      <StintFields state={state} />
      <div className="flex items-center gap-2">
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
        <button disabled={pending} className={primaryBtn}>{pending ? "Adding…" : "Add stint"}</button>
      </div>
    </form>
  );
}

function EditClubStintForm({
  playerId, stint, onDone,
}: { playerId: number; stint: ClubStint; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateClubStint.bind(null, stint.id, playerId), { ok: false });
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);

  return (
    <form action={action} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <input type="hidden" name="club_id" value={stint.club_id} />
      <p className="text-sm font-medium">{stint.club?.name}</p>
      <StintFields state={state} defaults={stint} />
      <div className="flex items-center gap-2">
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
        <button disabled={pending} className={primaryBtn}>{pending ? "Saving…" : "Save stint"}</button>
      </div>
    </form>
  );
}

export default function ClubStintsCard({
  playerId, stints, clubs,
}: { playerId: number; stints: ClubStint[]; clubs: { id: number; name: string }[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const refresh = () => { setAdding(false); setEditingId(null); router.refresh(); };

  const remove = async (id: number) => {
    if (!confirm("Remove this club stint?")) return;
    setBusyId(id);
    const res = await deleteClubStint(id, playerId);
    setBusyId(null);
    if (!res.ok) { alert(res.message ?? "Could not delete."); return; }
    router.refresh();
  };

  return (
    <Card title="Club stints" note={`${stints.length} record${stints.length === 1 ? "" : "s"}`}>
      {stints.length === 0 && <p className="mb-2 text-sm text-neutral-500">No club stints yet. Add a club before linking a stint.</p>}
      <div className="space-y-2">
        {stints.map((s) =>
          editingId === s.id ? (
            <EditClubStintForm key={s.id} playerId={playerId} stint={s} onDone={refresh} />
          ) : (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{s.club?.name ?? "—"}</span>
                <span className="ml-2 text-neutral-500">{s.start_year}–{s.end_year ?? "present"}</span>
                {s.is_loan && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Loan</span>}
                {(s.appearances != null || s.goals != null) && (
                  <span className="ml-2 text-neutral-500">{s.appearances ?? "—"} apps · {s.goals ?? "—"} goals</span>
                )}
              </span>
              <span className="flex gap-3">
                <button type="button" className="text-xs underline" onClick={() => setEditingId(s.id)}>Edit</button>
                <button type="button" disabled={busyId === s.id} className="text-xs text-red-700 underline disabled:opacity-50" onClick={() => remove(s.id)}>
                  {busyId === s.id ? "Removing…" : "Remove"}
                </button>
              </span>
            </div>
          )
        )}
      </div>
      <div className="mt-3">
        {adding ? (
          <AddClubStintForm playerId={playerId} clubs={clubs} onDone={refresh} />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={ghostBtn}>+ Add club stint</button>
        )}
      </div>
    </Card>
  );
}