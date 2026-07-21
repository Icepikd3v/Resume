import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, findBlogPostBySlug } from "@/lib/blog-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = findBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="page-shell blog-post-page">
      <section className="panel hero">
        <p className="eyebrow">Capstone Blog</p>
        <h1>{post.title}</h1>
        <p className="intro">{post.subtitle}</p>
        <p className="muted">
          By {post.author} • {post.date}
        </p>
        <div className="project-links">
          <Link href="/blog" className="inline-link">
            Back to Blog
          </Link>
          {post.projectSlug ? (
            <Link href={`/projects/${post.projectSlug}`} className="inline-link">
              View Project Page
            </Link>
          ) : null}
        </div>
      </section>

      <section className="panel capstone-journal">
        <p className="section-lead">{post.intro}</p>
        {post.sections.map((section) => (
          <article className="blog-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Development Visuals</h2>
        <div className="journal-visual-grid">
          {post.visuals.map((visual) => (
            <figure className="journal-visual-card" key={visual.src}>
              <img src={visual.src} alt={visual.alt} />
              <figcaption>{visual.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Retrospective</h2>
        <div className="grid columns-3">
          <article className="card">
            <h3>What Went Right</h3>
            <ul className="detail-list">
              {post.retrospective.wentRight.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h3>What Went Wrong</h3>
            <ul className="detail-list">
              {post.retrospective.wentWrong.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h3>Moving Forward</h3>
            <ul className="detail-list">
              {post.retrospective.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
