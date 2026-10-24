"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeleteResult } from "@/lib/form-state";

export default function DeleteRecordButton({
  id, name, noun, action, redirectTo,
}: {
  id: number; name: string; noun: string;
  action: (ids: number[]) => Promise<DeleteResult>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
      onClick={() => {
        if (!confirm(`Delete ${noun} "${name}"? This cannot be undone.`)) return;
        start(async () => {
          const res = await action([id]);
          if (!res.ok) {
            alert(res.message ?? "Could not delete.");
            return;
          }
          router.push(redirectTo);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}