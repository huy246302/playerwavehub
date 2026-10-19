"use client";
import { useTransition } from "react";
import { deletePerson } from "@/lib/actions/people";

export default function DeletePersonButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      className="text-sm text-red-700 underline disabled:opacity-50"
      onClick={() => {
        if (!confirm(`Delete ${name}?`)) return;
        start(async () => {
          try { await deletePerson(id); }
          catch (e) { alert((e as Error).message); }
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}