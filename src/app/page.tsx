import Link from "next/link";

export default function Home() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Docsies</p><h1 className="mt-5 text-5xl font-semibold tracking-tight">The calm place for your team&apos;s runbooks.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">Private DevOps documentation with Markdown, searchable categories, image-backed examples, and a focused reading experience.</p><Link href="/docs" className="mt-8 inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Open documentation</Link></div></main>;
}
