import Link from "next/link";

export default function HomePage() {
  return (
    <section>
      <h1>Welcome 👋</h1>
      <p>
        This is the home of <strong>Growth Lessons</strong> — a place where I
        share what I learn along the way.
      </p>
      <p>
        Head over to the <Link href="/blog">blog</Link> to read the latest
        posts.
      </p>
    </section>
  );
}
