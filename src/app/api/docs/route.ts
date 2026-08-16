import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createDoc } from "@/lib/repository";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !["editor", "admin"].includes(session.role)) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const body = await request.json();
  if (!body.title || !body.slug || !body.content) return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
  try { await createDoc({ title: body.title, slug: body.slug, content: body.content, categoryId: body.categoryId || null, authorId: session.id }); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create document" }, { status: 400 }); }
}
