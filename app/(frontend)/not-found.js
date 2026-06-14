import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="article">
        <h1>Page not found</h1>
        <p className="meta">That page does not exist.</p>
        <Link href="/" className="back-link">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
