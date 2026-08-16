import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "docsies_session";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is required. Copy .env.example to .env.local.");
  return new TextEncoder().encode(value);
}

export async function createSession(user: { id: string; email: string; role: string }) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(request?: NextRequest) {
  const token = request?.cookies.get(COOKIE_NAME)?.value ?? (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.id), email: String(payload.email), role: String(payload.role) };
  } catch { return null; }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE_NAME);
}
