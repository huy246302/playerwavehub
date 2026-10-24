import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/"); // already signed in

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ee] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#47d392] font-serif text-xl font-bold text-white">
            F
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl text-neutral-900">Football Legends</div>
            <div className="text-[10px] font-medium tracking-[0.2em] text-neutral-500">ARCHIVE</div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-[#fbfaf6] p-7 shadow-sm">
          <h1 className="font-serif text-2xl text-neutral-900">Sign in</h1>
          <p className="mb-6 mt-1 text-sm text-neutral-500">
            Admin access to the archive dashboard.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          The game remembered. One story at a time.
        </p>
      </div>
    </div>
  );
}