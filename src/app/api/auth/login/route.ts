import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { findUserByEmail } from "@/lib/repository";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await findUserByEmail(String(email || ""));
  if (!user || !(await bcrypt.compare(String(password || ""), user.password_hash))) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createSession({ id: user.id, email: user.email, role: user.role });
  return NextResponse.json({ ok: true });
}
