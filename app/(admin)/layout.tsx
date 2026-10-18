import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-[#f6f4ee]">
        <header className="flex items-center justify-end gap-3 px-8 py-3 text-sm text-neutral-600">
          <span>
            {profile?.display_name ?? user.email}
            {profile?.role && <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-xs">{profile.role}</span>}
          </span>
          <form action={signOut}>
            <button className="underline">Sign out</button>
          </form>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}