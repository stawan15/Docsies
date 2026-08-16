import { db } from "@/lib/db";

export async function findUserByEmail(email: string) {
  const { rows } = await db.query("select id, email, password_hash, role from users where email = $1", [email.toLowerCase()]);
  return rows[0] as { id: string; email: string; password_hash: string; role: string } | undefined;
}

export async function listDocs() {
  const { rows } = await db.query("select d.title, d.slug, d.content, c.name as category_name from docs d left join categories c on c.id = d.category_id where d.is_published = true order by d.title");
  return rows as { title: string; slug: string; content: string; category_name: string | null }[];
}

export async function listDocLinks() {
  const { rows } = await db.query("select d.title, d.slug, c.name as category_name from docs d left join categories c on c.id = d.category_id where d.is_published = true order by c.name nulls last, d.title");
  return rows as { title: string; slug: string; category_name: string | null }[];
}

export async function findDoc(slug: string) {
  const { rows } = await db.query("select d.id, d.title, d.slug, d.content, d.category_id, d.updated_at from docs d where d.slug = $1 and d.is_published = true", [slug]);
  return rows[0] as { id: string; title: string; slug: string; content: string; category_id: string | null; updated_at: string } | undefined;
}

export async function listCategories() {
  const { rows } = await db.query("select id, name from categories order by name");
  return rows as { id: string; name: string }[];
}

export async function createDoc(input: { title: string; slug: string; content: string; categoryId: string | null; authorId: string }) {
  await db.query("insert into docs (title, slug, content, category_id, author_id, is_published) values ($1, $2, $3, $4, $5, true)", [input.title, input.slug, input.content, input.categoryId, input.authorId]);
}

export async function updateDoc(slug: string, input: { title: string; content: string; categoryId: string | null }) {
  const result = await db.query("update docs set title = $1, content = $2, category_id = $3, updated_at = now() where slug = $4 and is_published = true", [input.title, input.content, input.categoryId, slug]);
  if (!result.rowCount) throw new Error("Document not found");
}

export async function deleteDoc(slug: string) {
  const result = await db.query("delete from docs where slug = $1", [slug]);
  if (!result.rowCount) throw new Error("Document not found");
}
