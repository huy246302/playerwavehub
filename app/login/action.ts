"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(_: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Same message for every failure, so it never reveals which part was wrong
  if (error) return { error: "Invalid email or password." };

  redirect("/");
}