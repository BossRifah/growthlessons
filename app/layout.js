import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Growth Lessons",
  description: "A blog about growth, lessons, and ideas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Growth Lessons
            </Link>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
            </nav>
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="site-footer">
          <div className="container">
            © {new Date().getFullYear()} Growth Lessons. Built with Next.js &
            Supabase.
          </div>
        </footer>
      </body>
    </html>
  );
}
