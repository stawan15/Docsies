import Link from "next/link";
import { listDocs } from "@/lib/repository";

export default async function DocsIndexPage() {
  const docs = await listDocs();
  return <div><div className="mb-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Knowledge base</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Team documentation</h1><p className="mt-3 text-slate-500">Runbooks and operational context, kept close to the work.</p></div>{docs.length ? <div className="grid gap-4 sm:grid-cols-2">{docs.map((doc) => <Link key={doc.slug} href={`/docs/${doc.slug}`} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"><p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">{doc.category_name || "Uncategorized"}</p><h2 className="mt-3 text-lg font-semibold">{doc.title}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-500">{doc.content.replace(/[#*_`]/g, "").slice(0, 140)}</p></Link>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No published documents yet. Add a document in PostgreSQL to get started.</div>}</div>;
}
