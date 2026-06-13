import { redirect } from "next/navigation";
import { isAuthed, adminConfigured } from "@/lib/admin-auth";
import { login } from "../actions";

export const dynamic = "force-dynamic";

const MESSAGES = {
  wrong: "That password is not right. Try again.",
  noconfig: "ADMIN_PASSWORD is not set on the server yet.",
};

export default async function LoginPage({ searchParams }) {
  if (await isAuthed()) redirect("/admin");
  const sp = await searchParams;
  const message = MESSAGES[sp?.error];

  return (
    <div className="admin-wrap admin-login">
      <h1 className="admin-title">Admin sign in</h1>
      <p className="admin-sub">Enter the admin password to manage posts.</p>
      {!adminConfigured() && (
        <div className="admin-error">
          Set the <code>ADMIN_PASSWORD</code> environment variable on the server
          to enable sign in.
        </div>
      )}
      {message && <div className="admin-error">{message}</div>}
      <form action={login} className="login-form">
        <input
          className="field-input"
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
        />
        <button type="submit" className="btn btn-purple">
          Sign in
        </button>
      </form>
    </div>
  );
}
