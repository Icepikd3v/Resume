import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug, findProjectsByIds, portfolioRepoProjectIds } from "@/lib/resume-data";
import { resolveProjectRuntime } from "@/lib/showcase-runtime";

type Props = {
  params: Promise<{ slug: string }>;
};

const projectSlugAliases: Record<string, string> = {
  "rick-and-morty-api-lookup": "rick-and-morty-react",
  readysettravel: "ready-set-travel"
};

function resolveShowcaseProject(slug: string) {
  return findProjectBySlug(projectSlugAliases[slug] || slug);
}

export async function generateStaticParams() {
  const repoProjects = findProjectsByIds(portfolioRepoProjectIds);
  return repoProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = resolveShowcaseProject(slug);

  if (!project?.showcase) {
    return { title: "Project Live Showcase" };
  }

  return {
    title: `${project.title} | Live Showcase`,
    description: project.showcase.subhero
  };
}

export default async function ProjectLiveShowcasePage({ params }: Props) {
  const { slug } = await params;
  const project = resolveShowcaseProject(slug);

  if (!project || !project.showcase) {
    notFound();
  }

  const runtime = resolveProjectRuntime(project);

  return (
    <div className="page-shell">
      <section
        className="panel showcase-hero"
        style={
          project.theme
            ? {
                borderColor: project.theme.accent,
                background: `linear-gradient(155deg, ${project.theme.surface}, rgba(9, 14, 25, 0.92))`
              }
            : undefined
        }
      >
        <p className="eyebrow">Live Project Showcase</p>
        <h1>{project.title}</h1>
        <p className="intro">{project.showcase.hero}</p>
        <div className="project-links">
          <Link href={`/projects/${project.slug}`} className="inline-link">
            Open Project Info
          </Link>
          {runtime ? (
            <a href={runtime.appUrl} target="_blank" rel="noreferrer">
              Open Full App
            </a>
          ) : null}
          {project.sourceUrl ? <a href={project.sourceUrl}>Repository</a> : null}
        </div>
      </section>

      {runtime ? (
        <section className="panel">
          <div className="runtime-box">
            <iframe
              src={runtime.appUrl}
              title={`${project.title} live app`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      ) : (
        <section className="panel">
          <p className="muted">Live runtime is not configured for this project yet.</p>
        </section>
      )}

      <section className="panel">
        <h2>Build Pillars</h2>
        <div className="grid columns-3">
          {project.showcase.featureBlocks.map((block) => (
            <article key={block.title} className="card">
              <h3>{block.title}</h3>
              <p>{block.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Project Stack</h2>
        <div className="chip-row">
          {project.stack.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
