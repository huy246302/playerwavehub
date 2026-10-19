"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPlayer, updatePlayer, type FormState } from "@/lib/actions/players";

type Props = {
  people: { id: number; full_name: string }[];
  player?: {
    id: number; person_id: number; person: { full_name: string } | null;
    career_start_year: number | null; retired_year: number | null;
    height_cm: number | null; legacy_summary: string | null; is_published: boolean;
  } | null;
};

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function PlayerForm({ people, player }: Props) {
  const router = useRouter();
  const editing = !!player;
  const [mode, setMode] = useState<"new" | "existing">("new");

  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updatePlayer.bind(null, player!.id) : createPlayer,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];

  useEffect(() => {
    if (state.ok && editing) router.push(`/players?id=${player!.id}`);
  }, [state, editing, player, router]);

  const tab = (value: "new" | "existing", label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`rounded-md px-3 py-1.5 text-sm ${
        mode === value ? "bg-[#254a39] text-white" : "border border-neutral-300 text-neutral-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form action={action} key={player?.id ?? "new"} className="space-y-4">
      {/* Person */}
      {editing ? (
        <Field label="Linked person">
          <input type="hidden" name="person_id" value={player!.person_id} />
          <div className={`${input} bg-neutral-100`}>{player!.person?.full_name}</div>
        </Field>
      ) : (
        <>
          <input type="hidden" name="person_mode" value={mode} />
          <div className="flex gap-2">
            {tab("new", "Create new person")}
            {tab("existing", "Link existing person")}
          </div>

          {mode === "existing" ? (
            <Field label="Linked person *" error={err("person_id")}>
              <select name="person_id" defaultValue="" className={input}>
                <option value="" disabled>
                  {people.length ? "Select a person…" : "No people without a player record"}
                </option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name *" error={err("full_name")}>
                <input name="full_name" placeholder="Nguyễn Văn A" className={input} />
              </Field>
              <Field label="Display name" error={err("display_name")}>
                <input name="display_name" placeholder="Short name used on the site" className={input} />
              </Field>
              <Field label="Date of birth" error={err("date_of_birth")}>
                <input name="date_of_birth" type="date" className={input} />
              </Field>
              <Field label="Date of death" error={err("date_of_death")}>
                <input name="date_of_death" type="date" className={input} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Birthplace" error={err("birthplace")}>
                  <input name="birthplace" className={input} />
                </Field>
              </div>
            </div>
          )}
        </>
      )}

      {/* Player */}
      <div className="grid grid-cols-3 gap-3 border-t border-neutral-200 pt-4">
        <Field label="Career start year" error={err("career_start_year")}>
          <input name="career_start_year" inputMode="numeric" placeholder="YYYY"
            defaultValue={player?.career_start_year ?? ""} className={input} />
        </Field>
        <Field label="Retired year" error={err("retired_year")}>
          <input name="retired_year" inputMode="numeric" placeholder="YYYY · optional"
            defaultValue={player?.retired_year ?? ""} className={input} />
        </Field>
        <Field label="Height (cm)" error={err("height_cm")}>
          <input name="height_cm" inputMode="numeric" placeholder="120–230 · optional"
            defaultValue={player?.height_cm ?? ""} className={input} />
        </Field>
      </div>

      <Field label="Legacy summary" error={err("legacy_summary")}>
        <textarea name="legacy_summary" rows={4} placeholder="Why is this person a legend? Add a short summary…"
          defaultValue={player?.legacy_summary ?? ""} className={input} />
      </Field>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Publication</span>
          <select name="status" defaultValue={player?.is_published ? "published" : "draft"} className={`${input} w-auto`}>
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
            className="rounded-md bg-[#254a39] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d3b2e] disabled:opacity-60">
            {pending ? "Saving…" : editing ? "Save changes" : "Save player"}
          </button>
        </div>
      </div>
    </form>
  );
}