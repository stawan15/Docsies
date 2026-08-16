import { headingSlug } from "@/lib/headings";

type Node = { type?: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[]; value?: string };

function textContent(node: Node): string {
  return node.type === "text" ? node.value || "" : (node.children || []).map(textContent).join("");
}

export function rehypeHeadingIds() {
  return (tree: Node) => {
    const used = new Map<string, number>();
    function visit(node: Node) {
      if (node.type === "element" && node.tagName && /^h[1-3]$/.test(node.tagName)) {
        const base = headingSlug(textContent(node));
        const count = used.get(base) || 0;
        used.set(base, count + 1);
        node.properties = { ...(node.properties || {}), id: count ? `${base}-${count}` : base };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
