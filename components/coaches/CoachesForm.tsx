"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCoach, updateCoach } from "@/lib/actions/coach";
import type { FormState } from "@/lib/form-state";

type Props = {
  biographies: { id: number; full_name: string }[];
  coach?: {
    id: number; biography_id: number; person: { full_name: string } | null;
    career_start_year: number | null; retired_year: number | null;
    legacy_summary: string | null; is_published: boolean;
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

export default function CoachForm({ biographies, coach }: Props) {
  const router = useRouter();
  const editing = !!coach;
  const [mode, setMode] = useState<"new" | "existing">("new");

  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateCoach.bind(null, coach!.id) : createCoach,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];

  useEffect(() => {
    if (state.ok && editing) router.push(`/head-coach?id=${coach!.id}#new`);
  }, [state, editing, coach, router]);

  const tab = (value: "new" | "existing", label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`rounded-md px-3 py-1.5 text-sm ${
        mode === value ? "bg-[#47d392] text-white" : "border border-neutral-300 text-neutral-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form action={action} key={coach?.id ?? "new"} className="space-y-4">
      {editing ? (
        <Field label="Linked biography">
          <input type="hidden" name="biography_id" value={coach!.biography_id} />
          <div className={`${input} bg-neutral-100`}>{coach!.person?.full_name}</div>
        </Field>
      ) : (
        <>
          <input type="hidden" name="person_mode" value={mode} />
          <div className="flex gap-2">
            {tab("new", "Create new biography")}
            {tab("existing", "Link existing biography")}
          </div>

          {mode === "existing" ? (
            <Field label="Linked biography *" error={err("biography_id")}>
              <select name="biography_id" defaultValue="" className={input}>
                <option value="" disabled>
                  {biographies.length ? "Select a biography…" : "No biographies without a coach record"}
                </option>
                {biographies.map((p) => (
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

      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
        <Field label="Career start year" error={err("career_start_year")}>
          <input name="career_start_year" inputMode="numeric" placeholder="YYYY"
            defaultValue={coach?.career_start_year ?? ""} className={input} />
        </Field>
        <Field label="Retired year" error={err("retired_year")}>
          <input name="retired_year" inputMode="numeric" placeholder="YYYY · optional"
            defaultValue={coach?.retired_year ?? ""} className={input} />
        </Field>
      </div>

      <Field label="Legacy summary" error={err("legacy_summary")}>
        <textarea name="legacy_summary" rows={4} placeholder="Why is this coach a legend? Add a short summary…"
          defaultValue={coach?.legacy_summary ?? ""} className={input} />
      </Field>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Publication</span>
          <select name="status" defaultValue={coach?.is_published ? "published" : "draft"} className={`${input} w-auto`}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {state.message && (
            <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>
          )}
          {editing && (
            <button type="button" onClick={() => router.push("/head-coach")}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm">Cancel</button>
          )}
          <button disabled={pending}
            className="rounded-md bg-[#47d392] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d3b2e] disabled:opacity-60">
            {pending ? "Saving…" : editing ? "Save changes" : "Save head coach"}
          </button>
        </div>
      </div>
    </form>
  );
}