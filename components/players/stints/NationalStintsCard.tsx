"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createNationalStint, updateNationalStint, deleteNationalStint } from "@/lib/actions/player-stints";
import type { NationalStint } from "@/lib/db/player-stints";
import type { FormState } from "@/lib/form-state";
import { Card, clampDigits ,fmtDate , ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";
import DateInput from "@/components/ui/DateInput";

function StintFields({ state, defaults }: { state: FormState; defaults?: Partial<NationalStint> }) {
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string) => state.values?.[k] ?? fallback ?? "";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Debut date</label>
        <DateInput name="debut_date" defaultValue={val("debut_date", defaults?.debut_date ?? undefined)} />
        {err("debut_date") && <p className="mt-1 text-xs text-red-600">{err("debut_date")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Last cap date</label>
        <DateInput name="last_cap_date" defaultValue={val("last_cap_date", defaults?.last_cap_date ?? undefined)} />
        {err("last_cap_date") && <p className="mt-1 text-xs text-red-600">{err("last_cap_date")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Caps</label>
        <input name="caps" type="number" inputMode="numeric" min={0} className={inputCls}
          onInput={clampDigits(4, 9999)}
          defaultValue={val("caps", defaults?.caps != null ? String(defaults.caps) : undefined)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Goals</label>
        <input name="goals" type="number" inputMode="numeric" min={0} className={inputCls}
          onInput={clampDigits(4, 9999)}
          defaultValue={val("goals", defaults?.goals != null ? String(defaults.goals) : undefined)} />
      </div>
    </div>
  );
}

function AddNationalStintForm({
  playerId, teams, onDone,
}: { playerId: number; teams: { id: number; name: string }[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createNationalStint.bind(null, playerId), { ok: false });
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
        <Link href="/national-teams/new" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#254a39] underline">
          + Add national team
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

function EditNationalStintForm({
  playerId, stint, onDone,
}: { playerId: number; stint: NationalStint; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateNationalStint.bind(null, stint.id, playerId), { ok: false });
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

export default function NationalStintsCard({
  playerId, stints, teams,
}: { playerId: number; stints: NationalStint[]; teams: { id: number; name: string }[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const refresh = () => { setAdding(false); setEditingId(null); router.refresh(); };

  const remove = async (id: number) => {
    if (!confirm("Remove this national team stint?")) return;
    setBusyId(id);
    const res = await deleteNationalStint(id, playerId);
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
            <EditNationalStintForm key={s.id} playerId={playerId} stint={s} onDone={refresh} />
          ) : (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
              <span>
                <span className="font-medium">{s.team?.name ?? "—"}</span>
                {s.debut_date && (
                  <span className="ml-2 text-neutral-500">
                    {fmtDate(s.debut_date)} – {s.last_cap_date ? fmtDate(s.last_cap_date) : "present"}
                  </span>
                )}
                {(s.caps != null || s.goals != null) && (
                  <span className="ml-2 text-neutral-500">{s.caps ?? "—"} caps · {s.goals ?? "—"} goals</span>
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
          <AddNationalStintForm playerId={playerId} teams={teams} onDone={refresh} />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={ghostBtn}>+ Add national stint</button>
        )}
      </div>
    </Card>
  );
}