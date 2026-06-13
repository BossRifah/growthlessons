import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { ChatIcon, DoodleBird, DoodleCreature } from "@/components/Doodles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { posts } = await getPublishedPosts(3);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <DoodleBird className="doodle doodle-left" />
        <DoodleCreature className="doodle doodle-right" />
        <div className="container">
          <h1>
            Lessons for <em>compounding</em> growth
          </h1>
          <p>
            Practical writing on growth, habits, and the small lessons that
            stack up over time. <span className="accent">[your tagline]</span>
          </p>
          <Link href="/blog" className="btn btn-purple">
            Read the blog <ChatIcon />
          </Link>
        </div>
      </section>

      {/* ---------------- Logo strip ---------------- */}
      <div className="logo-strip">
        <div className="container">
          <span className="logo-chip">As seen in</span>
          <span className="logo-chip">Logo</span>
          <span className="logo-chip">Logo</span>
          <span className="logo-chip">Logo</span>
          <span className="logo-chip">Logo</span>
          <span className="logo-chip">Logo</span>
        </div>
      </div>

      {/* ---------------- Value prop ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>
              Writing <em className="accent-purple">so good</em> it doesn&apos;t
              feel like reading homework
            </h2>
            <p>
              Every post is built to be useful, honest, and worth your time —
              short on fluff, long on real lessons. [Replace with your copy.]
            </p>
          </div>

          <div className="stat-grid">
            <div className="stat-card bg-purple">
              <span className="label">Readers</span>
              <span className="big">10k+ monthly</span>
            </div>
            <div className="stat-card bg-blue">
              <span className="label">Published</span>
              <span className="big">A new post every week</span>
            </div>
            <div className="stat-card bg-orange">
              <span className="label">Avg. read</span>
              <span className="big">5 min, no fluff</span>
            </div>
            <div className="stat-card bg-green">
              <span className="label">Cost</span>
              <span className="big">Always free</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Comparison ---------------- */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <h2>Growth is evolving</h2>
          </div>
          <div className="compare">
            <div className="compare-card">
              <h3>The old way</h3>
              <ul>
                <li>Generic advice that fits no one</li>
                <li>Hype with no follow-through</li>
                <li>Content written to fill a calendar</li>
                <li>Lessons you forget by lunch</li>
              </ul>
            </div>
            <div className="vs">vs.</div>
            <div className="compare-card good">
              <h3>The Growth Lessons way</h3>
              <ul>
                <li>Specific, tested takeaways</li>
                <li>Honest stories, wins and misses</li>
                <li>Written because it matters</li>
                <li>Ideas that actually stick</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- What to expect ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>What can you expect?</h2>
            <p>A simple rhythm you can count on. [Replace with your copy.]</p>
          </div>
          <div className="steps-grid">
            {[
              ["1", "Real context", "Lessons grounded in what actually happened, not theory."],
              ["2", "A clear idea", "One takeaway per post, explained simply."],
              ["3", "Useful detail", "Enough specifics that you can act on it today."],
              ["4", "Honest results", "What worked, what didn't, and why."],
            ].map(([num, title, body]) => (
              <div className="step" key={num}>
                <span className="num">{num}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Latest posts ---------------- */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <h2>Lessons worth giving a hoot about</h2>
          </div>

          {posts.length === 0 ? (
            <div className="empty">
              No published posts yet. Add one in your Supabase{" "}
              <strong>Table Editor → posts</strong> (set <code>published</code>{" "}
              to true) and it will appear here.
            </div>
          ) : (
            <>
              <div className="card-grid">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 36 }}>
                <Link href="/blog" className="btn btn-outline">
                  See all posts
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section" id="contact">
        <div className="container">
          <div className="cta">
            <div>
              <h2>Quit horsin&apos; around — let&apos;s talk</h2>
              <p>
                Got a question, an idea, or a lesson to share? Drop a note and
                I&apos;ll get back to you. [Replace with your copy.]
              </p>
            </div>
            <form className="cta-form" action="#">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="you@example.com" />
              <label htmlFor="msg">Anything you&apos;d like to add?</label>
              <textarea id="msg" rows={3} placeholder="How can I help?" />
              <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-light">
                  Send it over
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
