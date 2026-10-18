// components/players/PlayerForm.tsx
"use client";
import { useActionState } from "react";
import { createPlayer, type FormState } from "@/lib/actions/players";

export default function PlayerForm({ people }: { people: { id: number; full_name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createPlayer, { ok: false });
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action}>
      <select name="person_id" required defaultValue="">
        <option value="" disabled>Select a person…</option>
        {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
      </select>
      {err("person_id") && <p>{err("person_id")}</p>}

      <input name="career_start_year" placeholder="YYYY" inputMode="numeric" />
      <input name="retired_year" placeholder="YYYY · optional" inputMode="numeric" />
      {err("retired_year") && <p>{err("retired_year")}</p>}
      <input name="height_cm" placeholder="120–230 · optional" inputMode="numeric" />
      <textarea name="legacy_summary" placeholder="Why is this person a legend?" />

      <select name="status" defaultValue="draft">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <button disabled={pending}>Save player</button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}