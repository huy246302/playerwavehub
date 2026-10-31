"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePlayerPosition, setPrimaryPosition, deletePlayerPosition } from "@/lib/actions/player-positions";
import { POSITION_CODES } from "@/lib/validation/position";
import { POSITION_NAMES, ratingTier, type PositionCode } from "@/lib/positions";
import type { PlayerPosition } from "@/lib/db/player-positions";
import PitchMap from "@/components/players/PitchMap";
import { Card, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type Draft = { position: PositionCode | ""; rating: string; primary: boolean };
type Msg = { ok: boolean; text: string };

const smallBtn =
  "rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50";

export default function PositionsCard({
  playerId, positions,
}: { playerId: number; positions: PlayerPosition[] }) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);   // null = editor closed
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  const owned = new Map(positions.map((p) => [p.position as PositionCode, p]));
  const available = POSITION_CODES.filter((c) => !owned.has(c));
  const hasPrimary = positions.some((p) => p.is_primary);

  const openEditor = (code: PositionCode | "") => {
    const p = code ? owned.get(code) : undefined;
    setMsg(null);
    setDraft({ position: code, rating: p ? String(p.rating) : "", primary: p ? p.is_primary : !hasPrimary });
  };

  const run = async (task: () => Promise<{ ok: boolean; message?: string }>, okText: string) => {
    setBusy(true); setMsg(null);
    const res = await task();
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: res.message ?? "Something went wrong." }); return false; }
    setMsg({ ok: true, text: okText });
    router.refresh();
    return true;
  };

  const save = async () => {
    if (!draft || !draft.position) { setMsg({ ok: false, text: "Select a position." }); return; }
    const rating = Number(draft.rating);
    if (draft.rating.trim() === "" || !Number.isInteger(rating) || rating < 1 || rating > 100) {
      setMsg({ ok: false, text: "Enter a whole number from 1 to 100." }); return;
    }
    const ok = await run(
      () => savePlayerPosition(playerId, { position: draft.position, rating, makePrimary: draft.primary }),
      `${draft.position} saved.`
    );
    if (ok) setDraft(null);
  };

  const remove = async (code: PositionCode) => {
    if (!confirm(`Remove ${code} (${POSITION_NAMES[code]})?`)) return;
    if (draft?.position === code) setDraft(null);
    await run(() => deletePlayerPosition(playerId, code), `${code} removed.`);
  };

  const editing = draft?.position ? owned.get(draft.position) : undefined;
  const primaryLocked = !!draft && (!!editing?.is_primary || (!hasPrimary && !editing));

  return (
    <Card title="Positions" note={positions.length ? `${positions.length} position(s)` : "None added"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          Rating shows how comfortable the player is there (1–100). One position is the primary.
        </p>
        <div role="group" aria-label="Positions mode" className="flex shrink-0 rounded-lg border border-neutral-300 bg-white p-0.5 text-xs">
          {(["view", "edit"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={(m === "edit") === editMode}
              onClick={() => { setEditMode(m === "edit"); if (m === "view") { setDraft(null); setMsg(null); } }}
              className={`rounded-md px-3 py-1 ${(m === "edit") === editMode ? "bg-[#254a39] text-white" : "text-neutral-600"}`}>
              {m === "view" ? "View" : "Edit"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div>
          <PitchMap positions={positions} selected={draft?.position}
            onSelect={editMode ? (c) => openEditor(c) : undefined} />
          <p className="mt-2 text-center text-[11px] text-neutral-400">
            ★ primary{editMode ? " · tap a position to add or edit it" : ""}
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          {positions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
              No positions yet.{" "}
              {editMode ? "Tap a position on the pitch or use Add position below." : "Switch to Edit to add the first one."}
            </div>
          ) : (
            <ul className="space-y-2">
              {positions.map((p) => {
                const code = p.position as PositionCode;
                const tier = ratingTier(p.rating);
                return (
                  <li key={code} className={`rounded-lg border bg-white px-3 py-2.5 ${draft?.position === code ? "border-[#254a39]" : "border-neutral-200"}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="w-11 rounded-md bg-neutral-100 py-0.5 text-center text-sm font-semibold text-neutral-800">{code}</span>
                      <div className="min-w-[9rem] flex-1">
                        <div className="flex items-center gap-2 text-sm text-neutral-800">
                          {POSITION_NAMES[code]}
                          {p.is_primary && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">★ Primary</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200" aria-hidden="true">
                            <div className="h-full rounded-full" style={{ width: `${p.rating}%`, background: tier.fill }} />
                          </div>
                          <span className="w-8 text-right text-sm font-semibold tabular-nums">{p.rating}</span>
                          <span className="w-24 text-xs text-neutral-500">{tier.label}</span>
                        </div>
                      </div>
                      {editMode && (
                        <div className="flex gap-1.5">
                          <button type="button" className={smallBtn} disabled={busy} onClick={() => openEditor(code)}>Edit</button>
                          {!p.is_primary && (
                            <button type="button" className={smallBtn} disabled={busy}
                              onClick={() => run(() => setPrimaryPosition(playerId, code), `${code} is now the primary position.`)}>
                              Make primary
                            </button>
                          )}
                          <button type="button" className={`${smallBtn} text-red-700`} disabled={busy} onClick={() => remove(code)}>Remove</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {editMode && !draft && (
            <button type="button" className={ghostBtn} disabled={!available.length} onClick={() => openEditor(available[0] ?? "")}>
              {available.length ? "+ Add position" : "All 14 positions added"}
            </button>
          )}

          {editMode && draft && (
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="mb-3 font-serif text-base text-neutral-900">
                {editing ? `Edit ${draft.position}` : "Add a position"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pos-select" className="mb-1 block text-xs font-medium text-neutral-600">Position</label>
                  <select id="pos-select" className={inputCls} value={draft.position} disabled={!!editing}
                    onChange={(e) => setDraft({ ...draft, position: e.target.value as PositionCode })}>
                    <option value="" disabled>Select…</option>
                    {(editing ? [draft.position as PositionCode] : available).map((c) => (
                      <option key={c} value={c}>{c} — {POSITION_NAMES[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pos-rating" className="mb-1 block text-xs font-medium text-neutral-600">
                    Rating (1–100){draft.rating && Number(draft.rating) >= 1 && Number(draft.rating) <= 100 ? ` · ${ratingTier(Number(draft.rating)).label}` : ""}
                  </label>
                  <div className="flex items-center gap-3">
                    <input id="pos-rating" type="number" min={1} max={100} inputMode="numeric" className={`${inputCls} w-24`}
                      value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
                    <input type="range" min={1} max={100} aria-label="Rating slider" className="flex-1 accent-[#254a39]"
                      value={Number(draft.rating) || 1} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
                  </div>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2 text-sm text-neutral-700">
                <input type="checkbox" className="mt-0.5" checked={draft.primary || primaryLocked} disabled={primaryLocked}
                  onChange={(e) => setDraft({ ...draft, primary: e.target.checked })} />
                <span>
                  Primary position
                  <span className="block text-xs text-neutral-500">
                    {editing?.is_primary
                      ? "This is already the primary. To change it, open another position and tick this box."
                      : !hasPrimary
                        ? "The first position becomes the primary automatically."
                        : "Only one position can be primary. Ticking this replaces the current primary."}
                  </span>
                </span>
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button type="button" className={primaryBtn} disabled={busy} onClick={save}>
                  {busy ? "Saving…" : editing ? "Save changes" : "Add position"}
                </button>
                <button type="button" className={ghostBtn} disabled={busy} onClick={() => { setDraft(null); setMsg(null); }}>Cancel</button>
              </div>
            </div>
          )}

          <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg ? (msg.ok ? "text-green-700" : "text-red-600") : ""}`}>
            {msg?.text}
          </p>
          {editMode && (
            <p className="text-xs text-neutral-500">
              Two positions can share the same rating, even 100. You choose which one is primary.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
