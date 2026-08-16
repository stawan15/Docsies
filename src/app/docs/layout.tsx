import Link from "next/link";
import { listDocLinks } from "@/lib/repository";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const docs = await listDocLinks();
  const session = await getSession();
  const canManage = Boolean(session && ["editor", "admin"].includes(session.role));
  return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><Link href="/docs" className="font-semibold tracking-tight">Docsies <span className="text-cyan-600">/</span> Runbooks</Link><SignOutButton /></div></header><div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[220px_1fr]"><aside><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Documents</p>{canManage && <Link href="/docs/new" className="text-xs font-semibold text-cyan-700">New</Link>}</div><nav className="space-y-1">{docs.length ? docs.map((doc) => <Link key={doc.slug} href={`/docs/${doc.slug}`} className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-cyan-700">{doc.title}</Link>) : <p className="px-3 text-sm text-slate-400">No documents yet.</p>}</nav></aside><section className="min-w-0">{children}</section></div></div>;
}
