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
        <div className="blog-entry-list">
          {blogPosts.map((post) => (
            <article className="card blog-card" key={post.slug}>
              <p className="project-tag">{post.tags.join(" • ")}</p>
              <h2>{post.title}</h2>
              <p className="muted">
                By {post.author} • {post.date}
              </p>
              <p>{post.subtitle}</p>
              <div className="project-links">
                {post.projectSlug ? (
                  <Link href={`/projects/${post.projectSlug}`} className="inline-link">
                    View Project Page
                  </Link>
                ) : null}
              </div>
              <details className="blog-expand">
                <summary>Expand</summary>
                <div className="capstone-journal">
                  <p className="section-lead">{post.intro}</p>
                  {post.sections.map((section) => (
                    <section className="blog-section" key={section.title}>
                      <h3>{section.title}</h3>
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </section>
                  ))}
                </div>

                <section className="blog-expanded-section">
                  <h3>Development Visuals</h3>
                  <div className="journal-visual-grid">
                    {post.visuals.map((visual) => (
                      <figure className="journal-visual-card" key={visual.src}>
                        <img src={visual.src} alt={visual.alt} />
                        <figcaption>{visual.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>

                <section className="blog-expanded-section">
                  <h3>Retrospective</h3>
                  <div className="blog-retrospective-grid">
                    <div className="build-note-card">
                      <h4>What Went Right</h4>
                      <ul className="detail-list">
                        {post.retrospective.wentRight.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="build-note-card">
                      <h4>What Went Wrong</h4>
                      <ul className="detail-list">
                        {post.retrospective.wentWrong.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="build-note-card">
                      <h4>Moving Forward</h4>
                      <ul className="detail-list">
                        {post.retrospective.improvements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </details>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
