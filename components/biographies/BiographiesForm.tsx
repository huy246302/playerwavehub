"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPerson, updateBiography } from "@/lib/actions/biographies";
import type { FormState } from "@/lib/actions/players";

type Bio = {
  id: number; full_name: string; display_name: string | null;
  date_of_birth: string | null; date_of_death: string | null;
  birthplace: string | null; bio: string | null;
};

const input =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";

function Field({
  name, label, type = "text", placeholder, error, defaultValue,
}: {
  name: string; label: string; type?: string; placeholder?: string; error?: string; defaultValue?: string | null;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-600">{label}</label>
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue ?? ""} className={input} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function BiographiesForm({ biography }: { biography?: Bio | null }) {
  const router = useRouter();
  const editing = !!biography;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateBiography.bind(null, biography!.id) : createPerson,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];

  useEffect(() => {
    if (state.ok && editing) router.push("/biographies");
  }, [state, editing, router]);

  return (
    <form action={action} key={biography?.id ?? "new"} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="full_name" label="Full name *" placeholder="Nguyễn Văn A" defaultValue={biography?.full_name} error={err("full_name")} />
        <Field name="display_name" label="Display name" defaultValue={biography?.display_name} error={err("display_name")} />
        <Field name="date_of_birth" label="Date of birth" type="date" defaultValue={biography?.date_of_birth} error={err("date_of_birth")} />
        <Field name="date_of_death" label="Date of death" type="date" defaultValue={biography?.date_of_death} error={err("date_of_death")} />
      </div>
      <Field name="birthplace" label="Birthplace" defaultValue={biography?.birthplace} error={err("birthplace")} />
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Bio</label>
        <textarea name="bio" rows={4} defaultValue={biography?.bio ?? ""} className={input} />
        {err("bio") && <p className="mt-1 text-xs text-red-600">{err("bio")}</p>}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</span>
        )}
        {editing && (
          <button type="button" onClick={() => router.push("/biographies")}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm">Cancel</button>
        )}
        <button disabled={pending}
          className="rounded-md bg-[#47d392] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? "Saving…" : editing ? "Save changes" : "Save biography"}
        </button>
      </div>
    </form>
  );
}