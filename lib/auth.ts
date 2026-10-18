// lib/auth.ts
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); // getUser, not getSession
  if (!user) redirect("/login");

  const { data: profile } = await createAdminClient()
    .from("profiles").select("role").eq("id", user.id).single();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    throw new Error("Forbidden");
  }
  return user; // user.id satisfies created_by / updated_by -> profiles.id
}