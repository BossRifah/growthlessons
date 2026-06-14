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
            I&apos;m Rifah — a content-led growth marketer with 6+ years scaling
            B2B startups. I share the content, SEO, and growth lessons that moved
            real numbers, so you can move yours.
          </p>
          <Link href="/blog" className="btn btn-purple">
            Read the lessons <ChatIcon />
          </Link>
        </div>
      </section>

      {/* ---------------- Credibility strip ---------------- */}
      <div className="logo-strip">
        <div className="container">
          <span className="logo-chip">6+ years experience</span>
          <span className="logo-chip">2 YC startups</span>
          <span className="logo-chip">B2B SaaS growth</span>
          <span className="logo-chip">SEO · Content · GEO</span>
        </div>
      </div>

      {/* ---------------- Value prop + stats ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>
              Real results, <em className="accent-purple">shared openly</em>
            </h2>
            <p>
              No theory, no fluff. Everything here comes from work that moved the
              needle at YC-backed B2B startups — and it&apos;s all yours to learn
              from.
            </p>
          </div>

          <div className="stat-grid">
            <div className="stat-card bg-purple">
              <span className="label">Organic traffic</span>
              <span className="big">2.5× in 7 months</span>
            </div>
            <div className="stat-card bg-blue">
              <span className="label">LLM visibility</span>
              <span className="big">+30% in 6 months</span>
            </div>
            <div className="stat-card bg-orange">
              <span className="label">Impressions</span>
              <span className="big">4× under 8 months</span>
            </div>
            <div className="stat-card bg-green">
              <span className="label">Content-led leads</span>
              <span className="big">+16%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Comparison ---------------- */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <h2>Growth is evolving</h2>
            <p>
              Search isn&apos;t just Google anymore. Here&apos;s the shift this
              blog is built around.
            </p>
          </div>
          <div className="compare">
            <div className="compare-card">
              <h3>The old way</h3>
              <ul>
                <li>Chasing tactics with no system</li>
                <li>Guessing what Google (and AI) wants</li>
                <li>Publishing content nobody reads</li>
                <li>Random wins you can&apos;t repeat</li>
              </ul>
            </div>
            <div className="vs">vs.</div>
            <div className="compare-card good">
              <h3>The content-led way</h3>
              <ul>
                <li>A repeatable, compounding system</li>
                <li>SEO + LLM visibility, done right</li>
                <li>Content built to rank and convert</li>
                <li>Results you can actually copy</li>
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
            <p>
              Whether you&apos;re a total beginner or leveling up, here&apos;s
              what you&apos;ll walk away with.
            </p>
          </div>
          <div className="steps-grid">
            {[
              ["1", "Real lessons", "Tactics pulled from actual campaigns, not recycled theory."],
              ["2", "Content & SEO", "How to rank in Google and show up in AI answers."],
              ["3", "Growth systems", "Repeatable playbooks built for B2B startups."],
              ["4", "Beginner → specialist", "Grow into a focused SEO, content, or growth pro."],
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
            <h2>Latest growth lessons</h2>
          </div>

          {posts.length === 0 ? (
            <div className="empty">
              No published posts yet. Create one in the{" "}
              <strong>admin at /admin</strong> and publish it to see it here.
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
                  See all lessons
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
              <h2>
                Let&apos;s talk <em>growth</em>
              </h2>
              <p>
                Got a question about SEO, content, or scaling a B2B startup? Or a
                lesson of your own to share? Send it over — I read everything.
              </p>
            </div>
            <form className="cta-form" action="#">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="you@example.com" />
              <label htmlFor="msg">What&apos;s on your mind?</label>
              <textarea id="msg" rows={3} placeholder="Ask me anything growth…" />
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
