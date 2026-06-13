import { notFound, redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase-admin";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const { id } = await params;

  const supabase = getAdminSupabase();
  if (!supabase) notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, content, cover_url, published")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();
  return <PostEditor post={post} />;
}
