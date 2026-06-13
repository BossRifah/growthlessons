import "./globals.css";
import Link from "next/link";
import { ChatIcon } from "@/components/Doodles";

export const metadata = {
  title: "Growth Lessons — Lessons for compounding growth",
  description:
    "A blog about growth, lessons, and ideas worth compounding on.",
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
            <nav className="site-nav">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/blog" className="nav-link">
                Blog
              </Link>
              <Link href="#contact" className="btn btn-purple">
                Let&apos;s talk <ChatIcon />
              </Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-col">
              <div className="brand" style={{ marginBottom: 16 }}>
                Growth Lessons
              </div>
              <form
                className="subscribe"
                action="#"
                aria-label="Newsletter signup"
              >
                <input type="email" placeholder="Email address" />
                <button className="btn btn-purple" type="submit">
                  Subscribe
                </button>
              </form>
              <p className="copyright">
                © {new Date().getFullYear()} Growth Lessons. Built with Next.js
                &amp; Supabase.
              </p>
            </div>

            <div className="footer-col">
              <h4>Explore</h4>
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
              <Link href="#contact">Contact</Link>
            </div>
            <div className="footer-col">
              <h4>Topics</h4>
              <Link href="/blog">Growth</Link>
              <Link href="/blog">Lessons</Link>
              <Link href="/blog">Ideas</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <Link href="#">About</Link>
              <Link href="#contact">Contact</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
