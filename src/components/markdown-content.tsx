import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import { rehypeHeadingIds } from "@/lib/rehype-heading-ids";
import { CopyCodeButton } from "@/components/copy-code-button";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHeadingIds,
          [rehypePrettyCode, { theme: "github-dark", keepBackground: false }],
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
        components={{
          pre({ children, ...props }) {
            return <div className="code-block"><CopyCodeButton /><pre {...props}>{children}</pre></div>;
          },
          img({ src, alt }) {
            if (!src) return null;
            return <figure className="my-8"><img src={src} alt={alt || ""} className="m-0 max-w-full rounded-2xl border border-slate-200 shadow-sm" /><figcaption className="mt-3 text-center text-sm text-slate-500">{alt}</figcaption></figure>;
          },
        }}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}
