import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin-auth";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  if (!(await isAuthed())) redirect("/admin/login");
  return <PostEditor />;
}
