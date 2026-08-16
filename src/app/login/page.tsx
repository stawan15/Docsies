"use client";

import { FormEvent, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Unable to sign in");
      setLoading(false);
      return;
    }
    router.push(searchParams.get("next") || "/docs");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">Docsies</p>
        <h1 className="text-3xl font-semibold">Team sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in with your local Docsies account.</p>
        <label className="mt-8 block text-sm text-slate-300">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" /></label>
        <label className="mt-4 block text-sm text-slate-300">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400" /></label>
        {error && <p role="alert" className="mt-4 text-sm text-rose-400">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading…</main>}><LoginForm /></Suspense>;
}
