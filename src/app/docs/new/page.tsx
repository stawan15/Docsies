import { listCategories } from "@/lib/repository";
import { DocEditor } from "@/components/doc-editor";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewDocPage() {
  const session = await getSession();
  if (!session || !["editor", "admin"].includes(session.role)) redirect("/docs");
  return <DocEditor categories={await listCategories()} />;
}
