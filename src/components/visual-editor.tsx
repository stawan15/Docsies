"use client";

import { useRef, useState } from "react";

type CodeDialog = { language: string; code: string };

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function VisualEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const [dialog, setDialog] = useState<CodeDialog | null>(null);

  function update() {
    onChange(editorRef.current?.innerHTML || "");
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    update();
  }

  function openCodeDialog() {
    const selection = window.getSelection();
    rangeRef.current = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    setDialog({ language: "bash", code: "" });
  }

  function insertCode() {
    if (!dialog || !editorRef.current) return;
    editorRef.current.focus();
    const html = "<pre data-language=\"" + escapeHtml(dialog.language) + "\"><code>" + escapeHtml(dialog.code) + "</code></pre><p><br></p>";
    const selection = window.getSelection();
    const range = rangeRef.current || document.createRange();
    if (!rangeRef.current) {
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    range.deleteContents();
    range.insertNode(range.createContextualFragment(html));
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    update();
    setDialog(null);
  }

  return <div className="visual-editor-shell">
    <div className="visual-toolbar" aria-label="Visual editor toolbar">
      <select aria-label="Text style" defaultValue="p" onChange={(event) => command("formatBlock", event.target.value)} className="visual-select"><option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select>
      <span className="toolbar-divider" />
      <button type="button" onClick={() => command("bold")} title="Bold">B</button><button type="button" onClick={() => command("italic")} title="Italic"><i>I</i></button><button type="button" onClick={() => command("underline")} title="Underline"><u>U</u></button><button type="button" onClick={() => command("insertUnorderedList")} title="Bullet list">• List</button><button type="button" onClick={() => command("insertOrderedList")} title="Numbered list">1. List</button>
      <span className="toolbar-divider" />
      <button type="button" onClick={openCodeDialog} className="code-toolbar-button" title="Insert code block">&lt;/&gt; Code block</button>
    </div>
    <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={update} dangerouslySetInnerHTML={{ __html: value }} className="visual-editor" role="textbox" aria-label="Visual document editor" />
    {dialog && <div className="code-dialog-backdrop" role="presentation"><div className="code-dialog" role="dialog" aria-modal="true" aria-labelledby="code-dialog-title"><div className="flex items-start justify-between gap-4"><div><h2 id="code-dialog-title" className="text-lg font-semibold text-slate-900">Insert code block</h2><p className="mt-1 text-sm text-slate-500">Choose a language for syntax highlighting.</p></div><button type="button" onClick={() => setDialog(null)} className="text-xl text-slate-400" aria-label="Close">×</button></div><label className="mt-5 block text-sm font-semibold text-slate-700">Language<select value={dialog.language} onChange={(event) => setDialog({ ...dialog, language: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="bash">Bash</option><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="python">Python</option><option value="sql">SQL</option><option value="json">JSON</option><option value="yaml">YAML</option><option value="dockerfile">Dockerfile</option><option value="text">Plain text</option></select></label><label className="mt-4 block text-sm font-semibold text-slate-700">Source code<textarea autoFocus value={dialog.code} onChange={(event) => setDialog({ ...dialog, code: event.target.value })} rows={9} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-950 px-3 py-2 font-mono text-sm leading-6 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-200" placeholder="Paste or type source code here..." /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={insertCode} disabled={!dialog.code.trim()} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Insert code</button></div></div></div>}
  </div>;
}
