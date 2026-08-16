import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !["editor", "admin"].includes(session.role)) return NextResponse.json({ error: "Editor access required" }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  try { return NextResponse.json({ url: await uploadImage(file) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 }); }
}
