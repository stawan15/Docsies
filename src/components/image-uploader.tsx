"use client";

import { ChangeEvent, useState } from "react";

export function ImageUploader({ onMarkdown, onHtml }: { onMarkdown: (markdown: string) => void; onHtml?: (html: string) => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<{ url: string; name: string } | null>(null);
  const [caption, setCaption] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading image…");
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    if (!response.ok) { const result = await response.json(); setStatus(result.error || "Upload failed"); return; }
    const { url } = await response.json();
    setUploaded({ url, name: file.name });
    setCaption(file.name);
    setStatus("Uploaded. Add a caption, then insert it into the document.");
    event.target.value = "";
  }

  function insertImage() {
    if (!uploaded) return;
    const finalCaption = caption.trim() || uploaded.name;
    if (onHtml) onHtml("<figure><img src=\"" + uploaded.url + "\" alt=\"" + finalCaption + "\" /><figcaption>" + finalCaption + "</figcaption></figure>");
    else onMarkdown("![" + finalCaption + "](" + uploaded.url + ")");
    setUploaded(null);
    setCaption("");
    setStatus("Image inserted with caption.");
  }

  return <section className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Add media</h2><p className="mt-1 text-sm text-slate-500">Upload an image and give readers a clear caption.</p></div><label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm ring-1 ring-cyan-200 transition hover:bg-cyan-50">Choose image<input type="file" accept="image/*" onChange={upload} className="sr-only" /></label></div>{uploaded && <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end"><img src={uploaded.url} alt="Preview" className="h-20 w-28 rounded-lg object-cover ring-1 ring-slate-200" /><label className="text-sm font-semibold text-slate-700">Caption<input value={caption} onChange={(event) => setCaption(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-cyan-500" /></label><button type="button" onClick={insertImage} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800">Insert image</button></div>}{status && <p className="mt-3 text-sm text-slate-600" role="status">{status}</p>}</section>;
}
