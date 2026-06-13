import { cookies } from "next/headers";
import { createHash } from "crypto";

// Lightweight password gate for the /admin CMS. Set ADMIN_PASSWORD on the
// server. On login we store an httpOnly cookie holding a hash of the password,
// so the raw password is never in the browser and the cookie can't be forged
// without knowing the server secret.
export const COOKIE = "gl_admin";

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function tokenFor(password) {
  return createHash("sha256").update(`growthlessons::${password}`).digest("hex");
}

export async function isAuthed() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const jar = await cookies();
  const cookie = jar.get(COOKIE);
  return Boolean(cookie) && cookie.value === tokenFor(pw);
}
