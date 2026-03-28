import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findLanguageBySlug, findProjectsByIds, languageShowcases } from "@/lib/resume-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return languageShowcases.map((language) => ({ slug: language.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const language = findLanguageBySlug(slug);

  if (!language) {
    return {
      title: "Language Showcase"
    };
  }

  return {
    title: `${language.name} Showcase`
  };
}

export default async function LanguagePage({ params }: Props) {
  const { slug } = await params;
  const language = findLanguageBySlug(slug);

  if (!language) {
    notFound();
  }

  const relatedProjects = findProjectsByIds(language.projectIds);

  return (
    <div className="page-shell">
      <section className="panel">
        <p className="eyebrow">Language Showcase</p>
        <h1>{language.name}</h1>
        <p className="intro">{language.summary}</p>
        <p className="muted">{language.tagline}</p>
        <Link href="/" className="inline-link">
          Back to Home
        </Link>
      </section>

      <section className="panel">
        <h2>Core Strengths</h2>
        <div className="chip-row">
          {language.strengths.map((strength) => (
            <span key={strength} className="chip">
              {strength}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{language.sampleTitle}</h2>
        <pre className="code-block">
          <code>{language.sampleCode}</code>
        </pre>
      </section>

      <section className="panel">
        <h2>Projects Using {language.name}</h2>
        <div className="grid columns-2">
          {relatedProjects.map((project) => (
            <article key={project.id} className="card">
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <p className="muted">{project.stack.join(" • ")}</p>
              <div className="project-links">
                <Link href={`/projects/${project.slug}/live`} className="inline-link">
                  Live Build
                </Link>
                <Link href={`/projects/${project.slug}`} className="inline-link">
                  Project Info
                </Link>
                {project.liveUrl ? <a href={project.liveUrl}>Live Demo</a> : null}
                {project.sourceUrl ? <a href={project.sourceUrl}>Source Code</a> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
