import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug, findProjectsByIds, portfolioRepoProjectIds } from "@/lib/resume-data";
import { resolveProjectRuntime } from "@/lib/showcase-runtime";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const repoProjects = findProjectsByIds(portfolioRepoProjectIds);
  return repoProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);

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
  const project = findProjectBySlug(slug);

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
        <p className="section-lead">{project.showcase.subhero}</p>
        <p className="muted">{project.showcase.audience}</p>
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
          <h2>Run Project</h2>
          <p className="muted">
            Live URL: <a href={runtime.appUrl}>{runtime.appUrl}</a>
          </p>
          {runtime.backendUrl ? (
            <p className="muted">
              Backend URL: <a href={runtime.backendUrl}>{runtime.backendUrl}</a>
            </p>
          ) : null}
          {runtime.notes ? <p className="section-lead">{runtime.notes}</p> : null}
          <div className="runtime-box">
            <iframe
              src={runtime.appUrl}
              title={`${project.title} live app`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <h3>Startup Commands</h3>
          <div className="code-block">
            {runtime.startCommands.map((command) => (
              <pre key={command} className="cmd-line">
                <code>{command}</code>
              </pre>
            ))}
          </div>
        </section>
      ) : null}

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
