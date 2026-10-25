"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCoachNationalStint, updateCoachNationalStint, deleteCoachNationalStint } from "@/lib/actions/coach-stints";
import type { CoachNationalStint } from "@/lib/db/coach-stints";
import type { FormState } from "@/lib/form-state";
import { Card, clampDigits, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

function StintFields({ state, defaults }: { state: FormState; defaults?: Partial<CoachNationalStint> }) {
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
        <label className="mb-1 block text-xs font-medium text-neutral-600">Matches</label>
        <input name="matches" type="number" inputMode="numeric" min={0} className={inputCls} onInput={clampDigits(4, 9999)}
          defaultValue={val("matches", defaults?.matches != null ? String(defaults.matches) : undefined)} />
      </div>
      <label className="flex items-end gap-1.5 pb-2 text-sm text-neutral-600">
        <input type="checkbox" name="is_caretaker" defaultChecked={defaults?.is_caretaker} /> Caretaker
      </label>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Wins</label>
        <input name="wins" type="number" inputMode="numeric" min={0} className={inputCls} onInput={clampDigits(4, 9999)}
          defaultValue={val("wins", defaults?.wins != null ? String(defaults.wins) : undefined)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Draws</label>
        <input name="draws" type="number" inputMode="numeric" min={0} className={inputCls} onInput={clampDigits(4, 9999)}
          defaultValue={val("draws", defaults?.draws != null ? String(defaults.draws) : undefined)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Losses</label>
        <input name="losses" type="number" inputMode="numeric" min={0} className={inputCls} onInput={clampDigits(4, 9999)}
          defaultValue={val("losses", defaults?.losses != null ? String(defaults.losses) : undefined)} />
      </div>
    </div>
  );
}

function AddForm({ coachId, teams, onDone }: { coachId: number; teams: { id: number; name: string }[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createCoachNationalStint.bind(null, coachId), { ok: false });
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">National team *</label>
        <select name="national_team_id" defaultValue="" className={inputCls}>
          <option value="">{teams.length ? "Select a national team…" : "No national teams added yet"}</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {err("national_team_id") && <p className="mt-1 text-xs text-red-600">{err("national_team_id")}</p>}
        <Link href="/national-teams/new" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#254a39] underline">+ Add national team</Link>
      </div>
      <StintFields state={state} />
      <div className="flex items-center gap-2">
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
        <button disabled={pending} className={primaryBtn}>{pending ? "Adding…" : "Add stint"}</button>
      </div>
    </form>
  );
}

function EditForm({ coachId, stint, onDone }: { coachId: number; stint: CoachNationalStint; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateCoachNationalStint.bind(null, stint.id, coachId), { ok: false });
  useEffect(() => { if (state.ok) onDone(); }, [state, onDone]);

  return (
    <form action={action} className="space-y-3 rounded-md border border-neutral-200 p-3">
      <input type="hidden" name="national_team_id" value={stint.national_team_id} />
      <p className="text-sm font-medium">{stint.team?.name}</p>
      <StintFields state={state} defaults={stint} />
      <div className="flex items-center gap-2">
        {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
        <button disabled={pending} className={primaryBtn}>{pending ? "Saving…" : "Save stint"}</button>
      </div>
    </form>
  );
}

export default function CoachNationalStintsCard({
  coachId, stints, teams,
}: { coachId: number; stints: CoachNationalStint[]; teams: { id: number; name: string }[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const refresh = () => { setAdding(false); setEditingId(null); router.refresh(); };

  const remove = async (id: number) => {
    if (!confirm("Remove this national team stint?")) return;
    setBusyId(id);
    const res = await deleteCoachNationalStint(id, coachId);
    setBusyId(null);
    if (!res.ok) { alert(res.message ?? "Could not delete."); return; }
    router.refresh();
  };

  return (
    <Card title="National team stints" note={`${stints.length} record${stints.length === 1 ? "" : "s"}`}>
      {stints.length === 0 && <p className="mb-2 text-sm text-neutral-500">No national team stints yet. Add a team before linking a stint.</p>}
      <div className="space-y-2">
        {stints.map((s) =>
          editingId === s.id ? (
            <EditForm key={s.id} coachId={coachId} stint={s} onDone={refresh} />
          ) : (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{s.team?.name ?? "—"}</span>
                <span className="ml-2 text-neutral-500">{s.start_year}–{s.end_year ?? "present"}</span>
                {s.is_caretaker && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Caretaker</span>}
                {(s.wins != null || s.draws != null || s.losses != null) && (
                  <span className="ml-2 text-neutral-500">{s.wins ?? "—"}W {s.draws ?? "—"}D {s.losses ?? "—"}L</span>
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
        {adding ? <AddForm coachId={coachId} teams={teams} onDone={refresh} /> : <button type="button" onClick={() => setAdding(true)} className={ghostBtn}>+ Add national stint</button>}
      </div>
    </Card>
  );
}