import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";

export default function BlogIndexPage() {
  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Build Journal</p>
        <h1>Capstone Blog</h1>
        <p className="intro">
          A running journal of the HomeFit AI capstone build, including features, decisions,
          screenshots, research notes, and retrospectives.
        </p>
      </section>

      <section className="panel">
        <div className="grid columns-2">
          {blogPosts.map((post) => (
            <article className="card blog-card" key={post.slug}>
              <p className="project-tag">{post.tags.join(" • ")}</p>
              <h2>{post.title}</h2>
              <p className="muted">
                By {post.author} • {post.date}
              </p>
              <p>{post.subtitle}</p>
              <div className="project-links">
                <Link href={`/blog/${post.slug}`} className="inline-link">
                  Read Blog Entry
                </Link>
                {post.projectSlug ? (
                  <Link href={`/projects/${post.projectSlug}`} className="inline-link">
                    View Project Page
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
