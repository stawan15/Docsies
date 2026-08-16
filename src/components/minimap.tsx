"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";

export function Minimap({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className="sticky top-8 hidden max-h-[calc(100vh-4rem)] overflow-auto lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">On this page</p>
      <ol className="space-y-1 border-l border-slate-200 pl-4 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 1 ? "mt-3" : ""}>
            <a href={`#${heading.id}`} className={`block py-1 transition ${activeId === heading.id ? "font-semibold text-cyan-700" : "text-slate-500 hover:text-slate-900"}`} style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
