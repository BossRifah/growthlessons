"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getAdminSupabase,
  resolveAuthorId,
  slugify,
  uniqueSlug,
} from "@/lib/supabase-admin";
import { COOKIE, tokenFor, isAuthed } from "@/lib/admin-auth";

export async function login(formData) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) redirect("/admin/login?error=noconfig");
  const entered = String(formData.get("password") || "");
  if (entered !== pw) redirect("/admin/login?error=wrong");

  const jar = await cookies();
  jar.set(COOKIE, tokenFor(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}

export async function savePost(formData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const supabase = getAdminSupabase();
  if (!supabase) throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY.");

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  if (!title) redirect(`/admin/${id ? `edit/${id}` : "new"}?error=title`);

  const content = String(formData.get("content") || "");
  const excerpt = String(formData.get("excerpt") || "").trim().slice(0, 200);
  const coverUrl = String(formData.get("cover_url") || "").trim();
  const published = formData.get("published") === "on";
  const requestedSlug =
    String(formData.get("slug") || "").trim() || slugify(title);

  const row = {
    title,
    excerpt,
    content,
    cover_url: coverUrl || null,
    published,
  };

  if (id) {
    // Preserve the original publish date the first time it went live.
    const { data: existing } = await supabase
      .from("posts")
      .select("slug, published_at")
      .eq("id", id)
      .maybeSingle();
    row.slug = await uniqueSlug(supabase, slugify(requestedSlug), id);
    row.published_at = published
      ? existing?.published_at || new Date().toISOString()
      : null;
    const { error } = await supabase.from("posts").update(row).eq("id", id);
    if (error) throw new Error("Update failed: " + error.message);
  } else {
    row.slug = await uniqueSlug(supabase, slugify(requestedSlug));
    row.published_at = published ? new Date().toISOString() : null;
    const authorId = await resolveAuthorId(supabase);
    if (authorId) row.author_id = authorId;
    const { error } = await supabase.from("posts").insert(row);
    if (error) throw new Error("Insert failed: " + error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  if (row.slug) revalidatePath(`/blog/${row.slug}`);
  redirect("/admin");
}

export async function deletePost(formData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const supabase = getAdminSupabase();
  if (!supabase) throw new Error("Server is missing SUPABASE_SERVICE_ROLE_KEY.");
  const id = String(formData.get("id") || "").trim();
  if (id) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error("Delete failed: " + error.message);
  }
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin");
}
