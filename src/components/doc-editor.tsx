"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image-uploader";
import { VisualEditor } from "@/components/visual-editor";

type InitialDoc = { title: string; slug: string; content: string; categoryId: string | null };

function ToolbarButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return <button type="button" title={title} onClick={onClick} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">{label}</button>;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToHtml(markdown: string) {
  return markdown.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim();
    const code = /^\x60\x60\x60(\w*)\n([\s\S]*?)\n\x60\x60\x60$/.exec(trimmed);
    if (code) return "<pre data-language=\"" + (code[1] || "text") + "\"><code>" + escapeHtml(code[2]) + "</code></pre>";
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) return "<h" + heading[1].length + ">" + escapeHtml(heading[2]) + "</h" + heading[1].length + ">";
    return "<p>" + escapeHtml(trimmed).replace(/\n/g, "<br />") + "</p>";
  }).join("");
}

function htmlToMarkdown(html: string) {
  const root = new DOMParser().parseFromString(html, "text/html").body;
  function serialize(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (!(node instanceof HTMLElement)) return Array.from(node.childNodes).map(serialize).join("");
    const children = Array.from(node.childNodes).map(serialize).join("");
    const tag = node.tagName.toLowerCase();
    if (/^h[1-3]$/.test(tag)) return "#".repeat(Number(tag[1])) + " " + children.trim() + "\n\n";
    if (tag === "strong" || tag === "b") return "**" + children + "**";
    if (tag === "em" || tag === "i") return "*" + children + "*";
    if (tag === "u") return "<u>" + children + "</u>";
    if (tag === "br") return "\n";
    if (tag === "p" || tag === "div") return children.trim() ? children.trim() + "\n\n" : "";
    if (tag === "ul") return Array.from(node.children).map((item) => "- " + serialize(item).trim()).join("\n") + "\n\n";
    if (tag === "ol") return Array.from(node.children).map((item, index) => String(index + 1) + ". " + serialize(item).trim()).join("\n") + "\n\n";
    if (tag === "li") return children;
    if (tag === "pre") {
      const language = node.getAttribute("data-language") || "text";
      return "\x60\x60\x60" + language + "\n" + (node.textContent || "").trim() + "\n\x60\x60\x60\n\n";
    }
    if (tag === "a") return "[" + children + "](" + (node.getAttribute("href") || "") + ")";
    if (tag === "img") return "![" + (node.getAttribute("alt") || "") + "](" + (node.getAttribute("src") || "") + ")";
    if (tag === "figure") {
      const image = node.querySelector("img");
      const caption = node.querySelector("figcaption")?.textContent || image?.alt || "";
      return image ? "![" + caption + "](" + (image.getAttribute("src") || "") + ")\n\n" : children;
    }
    return children;
  }
  return Array.from(root.childNodes).map(serialize).join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function DocEditor({ categories, initialDoc }: { categories: { id: string; name: string }[]; initialDoc?: InitialDoc }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialContent = initialDoc?.content || "# New runbook\n\nStart writing here…";
  const initialIsHtml = initialContent.trim().startsWith("<");
  const [title, setTitle] = useState(initialDoc?.title || "");
  const [slug, setSlug] = useState(initialDoc?.slug || "");
  const [content, setContent] = useState(initialContent);
  const [categoryId, setCategoryId] = useState(initialDoc?.categoryId || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"markdown" | "visual">(initialDoc && !initialIsHtml ? "markdown" : "visual");
  const [visualContent, setVisualContent] = useState(initialIsHtml ? initialContent : "<h1>New runbook</h1><p>Start writing here…</p>");

  function switchMode(nextMode: "markdown" | "visual") {
    if (nextMode === mode) return;
    if (nextMode === "visual") setVisualContent(content.trim().startsWith("<") ? content : markdownToHtml(content));
    if (nextMode === "markdown" && visualContent) setContent(htmlToMarkdown(visualContent));
    setMode(nextMode);
  }

  function wrapSelection(before: string, after = before, fallback = "ข้อความของคุณ") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || fallback;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function addHeading(level: 1 | 2) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const prefix = `${"#".repeat(level)} `;
    setContent(`${content.slice(0, lineStart)}${prefix}${content.slice(lineStart)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null);
    const editing = Boolean(initialDoc);
    const contentToSave = mode === "visual" ? htmlToMarkdown(visualContent) : content;
    const response = await fetch(editing ? `/api/docs/${slug}` : "/api/docs", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, slug, content: contentToSave, categoryId }) });
    if (!response.ok) { const result = await response.json(); setError(result.error || "Could not save document"); setSaving(false); return; }
    router.push(`/docs/${slug}`); router.refresh();
  }

  return <form onSubmit={save} className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Editor</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{initialDoc ? "Edit document" : "New document"}</h1><p className="mt-2 text-slate-500">Write clearly, then preview the result as your team will read it.</p></div>
      <button disabled={saving} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50">{saving ? "Saving…" : initialDoc ? "Save changes" : "Publish document"}</button>
    </div>
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
      <label className="block text-sm font-semibold text-slate-700">Title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /></label>
      <label className="block text-sm font-semibold text-slate-700">Slug<input required pattern="[a-z0-9-]+" inputMode="text" placeholder="deploy-production" readOnly={Boolean(initialDoc)} value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono font-normal outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 read-only:bg-slate-100" /><span className="mt-1 block text-xs font-normal text-slate-500">ใช้ภาษาอังกฤษ ตัวเลข และเครื่องหมาย - เท่านั้น</span></label>
      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-cyan-500"><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-3"><div className="flex gap-1 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => switchMode("visual")} className={mode === "visual" ? "rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-cyan-700 shadow-sm" : "rounded-md px-3 py-1.5 text-sm font-semibold text-slate-500"}>Visual</button><button type="button" onClick={() => switchMode("markdown")} className={mode === "markdown" ? "rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-cyan-700 shadow-sm" : "rounded-md px-3 py-1.5 text-sm font-semibold text-slate-500"}>Markdown</button></div><span className="pr-2 text-xs text-slate-400">{mode === "visual" ? "Write like Word or Teams" : "Advanced Markdown"}</span></div>
      {mode === "visual" ? <VisualEditor value={visualContent} onChange={setVisualContent} /> : <>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3" aria-label="Formatting toolbar">
        <ToolbarButton label="H1" title="Heading 1" onClick={() => addHeading(1)} /><ToolbarButton label="H2" title="Heading 2" onClick={() => addHeading(2)} /><span className="mx-1 h-6 w-px bg-slate-200" /><ToolbarButton label="B" title="Bold" onClick={() => wrapSelection("**")} /><ToolbarButton label="I" title="Italic" onClick={() => wrapSelection("*")} /><ToolbarButton label="Code" title="Inline code" onClick={() => wrapSelection("`")} /><ToolbarButton label="Link" title="Link" onClick={() => wrapSelection("[", "](https://example.com)")} /><span className="mx-1 h-6 w-px bg-slate-200" /><ToolbarButton label="A−" title="Small text" onClick={() => wrapSelection('<span data-text-size="small">', "</span>")} /><ToolbarButton label="A" title="Normal text" onClick={() => wrapSelection('<span data-text-size="normal">', "</span>")} /><ToolbarButton label="A+" title="Large text" onClick={() => wrapSelection('<span data-text-size="large">', "</span>")} />
      </div>
      <textarea ref={textareaRef} required value={content} onChange={(event) => setContent(event.target.value)} rows={22} aria-label="Markdown content" className="block w-full resize-y border-0 bg-white px-5 py-4 font-mono text-sm leading-7 outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-100" />
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">Tip: select text first, then use the toolbar. Markdown remains editable for advanced formatting.</div>
      </>}
    </section>
    <ImageUploader onMarkdown={(markdown) => setContent((current) => current + "\n\n" + markdown + "\n")} onHtml={mode === "visual" ? (html) => setVisualContent((current) => current + html) : undefined} />
    {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
  </form>;
}
