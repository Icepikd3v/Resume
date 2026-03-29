import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/portfolio-data";
import { getSiteContent } from "@/lib/content-store";
import { findProjectBySlug } from "@/lib/resume-data";
import { resolveProjectRuntime } from "@/lib/showcase-runtime";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const content = await getSiteContent();
  const basicProject =
    content.featuredProjects.find((entry) => entry.slug === slug) ||
    getProjectBySlug(slug);
  const projectSlugAliases: Record<string, string> = {
    "rick-and-morty-api-lookup": "rick-and-morty-react",
    readysettravel: "ready-set-travel"
  };

  const detailedProject = findProjectBySlug(slug) || findProjectBySlug(projectSlugAliases[slug] || slug);

  if (!basicProject && !detailedProject) {
    notFound();
  }

  const project = {
    slug,
    name: detailedProject?.title || basicProject?.name || slug,
    summary: detailedProject?.summary || basicProject?.summary || "No summary available.",
    stack: detailedProject?.stack || basicProject?.stack || [],
    repo: detailedProject?.sourceUrl || basicProject?.repo || ""
  };

  const runtime = detailedProject ? resolveProjectRuntime(detailedProject) : null;

  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Project Showcase</p>
        <h1>{project.name}</h1>
        <p className="intro">{project.summary}</p>
        <p className="muted">{project.stack.join(" • ")}</p>
        <div className="project-links">
          {project.repo ? <a href={project.repo}>Open Repository</a> : null}
          {runtime ? (
            <a href={runtime.appUrl} target="_blank" rel="noreferrer">
              Open Full App
            </a>
          ) : null}
          <Link href="/" className="inline-link">
            Back to Resume Site
          </Link>
        </div>
      </section>

      {runtime ? (
        <section className="panel">
          <div className="runtime-box">
            <iframe
              src={runtime.appUrl}
              title={`${project.name} runtime preview`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="project-links" style={{ marginTop: "0.95rem" }}>
            <Link href={`/projects/${slug}/live`} className="inline-link">
              Open Full Live Showcase Page
            </Link>
          </div>
        </section>
      ) : null}

      <section className="panel">
        <h2>Why This Matters</h2>
        <p>
          This project demonstrates practical capability in production-style systems, API integration,
          and user-ready implementation patterns.
        </p>
      </section>
    </div>
  );
}
