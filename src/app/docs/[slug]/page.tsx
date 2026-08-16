import { notFound } from "next/navigation";
import { findDoc } from "@/lib/repository";
import { extractHeadings } from "@/lib/headings";
import { MarkdownContent } from "@/components/markdown-content";
import { Minimap } from "@/components/minimap";
import { DocActions } from "@/components/doc-actions";
import { getSession } from "@/lib/auth";

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await findDoc(slug);
  if (!doc) notFound();
  const session = await getSession();
  const canManage = Boolean(session && ["editor", "admin"].includes(session.role));
  const headings = extractHeadings(doc.content);
  return <article><div className="mb-10 border-b border-slate-200 pb-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(doc.updated_at))}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{doc.title}</h1></div>{canManage && <DocActions slug={doc.slug} />}</div></div><div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]"><MarkdownContent content={doc.content} /><Minimap headings={headings} /></div></article>;
}
