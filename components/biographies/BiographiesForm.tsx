// components/biographies/BiographiesForm.tsx
"use client";
import { useActionState } from "react";
import { createPerson } from "@/lib/actions/biographies";
import type { FormState } from "@/lib/actions/players";

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";

function Field({
  name, label, type = "text", placeholder, error,
}: {
  name: string; label: string; type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-600">{label}</label>
      <input name={name} type={type} placeholder={placeholder} className={input} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function BiographiesForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createPerson, { ok: false });
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="full_name" label="Full name *" placeholder="Nguyễn Văn A" error={err("full_name")} />
        <Field name="display_name" label="Display name" placeholder="Short name used on the site" error={err("display_name")} />
        <Field name="date_of_birth" label="Date of birth" type="date" error={err("date_of_birth")} />
        <Field name="date_of_death" label="Date of death" type="date" error={err("date_of_death")} />
      </div>
      <Field name="birthplace" label="Birthplace" error={err("birthplace")} />
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Bio</label>
        <textarea name="bio" rows={4} className={input} />
        {err("bio") && <p className="mt-1 text-xs text-red-600">{err("bio")}</p>}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>
        )}
        <button
          disabled={pending}
          className="rounded-md bg-[#254a39] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save biography"}
        </button>
      </div>
    </form>
  );
}