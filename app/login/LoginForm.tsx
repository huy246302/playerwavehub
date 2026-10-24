"use client";
import { useActionState, useState } from "react";
import { signIn, type LoginState } from "./action";

const field =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none " +
  "placeholder:text-neutral-400 focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-neutral-600">Email</label>
        <input
          id="email" name="email" type="email" required autoFocus
          autoComplete="email" placeholder="you@example.com" className={field}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-neutral-600">Password</label>
        <div className="relative">
          <input
            id="password" name="password" type={show ? "text" : "password"} required
            autoComplete="current-password" placeholder="••••••••" className={`${field} pr-16`}
          />
          <button
            type="button" onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-3 text-xs text-neutral-500 hover:text-neutral-800"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-md bg-[#47d392] py-2.5 text-sm font-medium text-white
                   hover:bg-[#1d3b2e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}