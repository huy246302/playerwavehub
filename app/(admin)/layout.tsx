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

const ROLE_LABEL: Record<string, string> = { admin: "Administrator", editor: "Editor" };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
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

  const name = profile?.display_name ?? user.email ?? "User";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-column">
        <header className="topbar">
          <div className="user-chip">
            <span className="user-avatar" aria-hidden>{initials(name)}</span>
            <span className="user-name">{name}</span>
            {profile?.role && (
              <span className="user-role">{ROLE_LABEL[profile.role] ?? profile.role}</span>
            )}
          </div>
          <form action={signOut}>
            <button className="signout-btn">Sign out</button>
          </form>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}