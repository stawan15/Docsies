"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DocActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Delete this document? This action cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    const response = await fetch(`/api/docs/${slug}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Could not delete document");
      setDeleting(false);
      return;
    }
    router.push("/docs");
    router.refresh();
  }

  return <div className="flex items-center gap-2">
    <Link href={`/docs/${slug}/edit`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700">Edit</Link>
    <button type="button" onClick={remove} disabled={deleting} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button>
    {error && <span role="alert" className="text-sm text-rose-600">{error}</span>}
  </div>;
}
