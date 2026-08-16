export type Heading = { id: string; text: string; level: 1 | 2 | 3 };

export function headingSlug(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/gu, "-") || "section";
}

export function extractHeadings(markdown: string): Heading[] {
  const used = new Map<string, number>();
  return markdown.split("\n").flatMap((line) => {
    const match = /^\s*(#{1,3})\s+(.+?)\s*#*\s*\r?$/.exec(line);
    if (!match) return [];
    const text = match[2].replace(/[*_`\[\]]/g, "").trim();
    const base = headingSlug(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return [{ id: count ? `${base}-${count}` : base, text, level: match[1].length as 1 | 2 | 3 }];
  });
}
