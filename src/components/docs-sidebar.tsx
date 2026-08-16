"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DocLink = { title: string; slug: string; category_name: string | null };

export function DocsSidebar({ docs, canManage }: { docs: DocLink[]; canManage: boolean }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const filtered = docs.filter((doc) => `${doc.title} ${doc.category_name || "Uncategorized"}`.toLowerCase().includes(query.toLowerCase().trim()));
    return filtered.reduce<Record<string, DocLink[]>>((result, doc) => {
      const category = doc.category_name || "Uncategorized";
      (result[category] ||= []).push(doc);
      return result;
    }, {});
  }, [docs, query]);

  return <aside className="docs-sidebar">
    <div className="sidebar-heading"><p className="eyebrow">Documents</p>{canManage && <Link href="/docs/new" className="new-doc-link">New</Link>}</div>
    <label className="sidebar-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search docs…" aria-label="Search documents" /></label>
    <nav className="docs-nav" aria-label="Documents">
      {Object.keys(groups).length ? Object.entries(groups).map(([category, categoryDocs]) => <div key={category} className="doc-group"><p className="doc-category">{category}</p>{categoryDocs.map((doc) => <Link key={doc.slug} href={`/docs/${doc.slug}`} className="doc-link">{doc.title}</Link>)}</div>) : <p className="empty-search">No matching documents.</p>}
    </nav>
  </aside>;
}
