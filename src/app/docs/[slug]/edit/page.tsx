import { notFound } from "next/navigation";
import { DocEditor } from "@/components/doc-editor";
import { listCategories } from "@/lib/repository";
import { findDoc } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session || !["editor", "admin"].includes(session.role)) redirect(`/docs/${slug}`);
  const [doc, categories] = await Promise.all([findDoc(slug), listCategories()]);
  if (!doc) notFound();
  return <DocEditor categories={categories} initialDoc={{ title: doc.title, slug: doc.slug, content: doc.content, categoryId: doc.category_id }} />;
}
