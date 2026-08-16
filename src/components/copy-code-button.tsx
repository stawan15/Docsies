"use client";

import { useState } from "react";

export function CopyCodeButton() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const container = document.activeElement?.closest(".code-block") || document.querySelector(".code-block");
    const code = container?.querySelector("pre code")?.textContent || "";
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return <button type="button" onClick={copyCode} className="copy-code-button" aria-label="Copy source code">{copied ? "Copied" : "Copy"}</button>;
}
