"use client";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPlayer, updatePlayer, type FormState } from "@/lib/actions/players";

type Props = {
  biographies: { id: number; full_name: string }[];
  player?: {
    id: number; biography_id: number; person: { full_name: string } | null;
    career_start_year: number | null; retired_year: number | null;
    height_cm: number | null; legacy_summary: string | null; is_published: boolean;
  } | null;
};

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";

export default function PlayerForm({ biographies, player }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const editing = !!player;

  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updatePlayer.bind(null, player!.id) : createPlayer,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];

  useEffect(() => {
    if (!state.ok) return;
    if (editing) router.push(`/players?id=${player!.id}`);
    else ref.current?.reset();
  }, [state, editing, player, router]);

  return (
    <form ref={ref} action={action} key={player?.id ?? "new"} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Linked person *</label>
        {editing ? (
          <>
            <input type="hidden" name="biography_id" value={player!.biography_id} />
            <div className={`${input} bg-neutral-100`}>{player!.person?.full_name}</div>
          </>
        ) : (
          <select name="biography_id" required defaultValue="" className={input}>
            <option value="" disabled>Select a person…</option>
            {biographies.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        )}
        {err("biography_id") && <p className="mt-1 text-xs text-red-600">{err("biography_id")}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Career start year</label>
          <input name="career_start_year" inputMode="numeric" placeholder="YYYY" className={input}
            defaultValue={player?.career_start_year ?? ""} />
          {err("career_start_year") && <p className="mt-1 text-xs text-red-600">{err("career_start_year")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Retired year</label>
          <input name="retired_year" inputMode="numeric" placeholder="YYYY · optional" className={input}
            defaultValue={player?.retired_year ?? ""} />
          {err("retired_year") && <p className="mt-1 text-xs text-red-600">{err("retired_year")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Height (cm)</label>
          <input name="height_cm" inputMode="numeric" placeholder="120–230 · optional" className={input}
            defaultValue={player?.height_cm ?? ""} />
          {err("height_cm") && <p className="mt-1 text-xs text-red-600">{err("height_cm")}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Legacy summary</label>
        <textarea name="legacy_summary" rows={4} placeholder="Why is this person a legend? Add a short summary…"
          className={input} defaultValue={player?.legacy_summary ?? ""} />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Publication</span>
          <select name="status" className={`${input} w-auto`} defaultValue={player?.is_published ? "published" : "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {state.message && (
            <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>
          )}
          {editing && (
            <button type="button" onClick={() => router.push("/players")}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm">Cancel</button>
          )}
          <button disabled={pending}
            className="rounded-md bg-[#47d392] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d3b2e] disabled:opacity-60">
            {pending ? "Saving…" : editing ? "Save changes" : "Save player"}
          </button>
        </div>
      </div>
    </form>
  );
}