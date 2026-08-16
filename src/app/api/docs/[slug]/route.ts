import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteDoc, updateDoc } from "@/lib/repository";

async function canManage() {
  const session = await getSession();
  return session && ["editor", "admin"].includes(session.role);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await canManage())) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const { slug } = await params;
  const body = await request.json();
  if (!body.title || !body.content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  try {
    await updateDoc(slug, { title: body.title, content: body.content, categoryId: body.categoryId || null });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update document" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await canManage())) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const { slug } = await params;
  try {
    await deleteDoc(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete document" }, { status: 400 });
  }
}
