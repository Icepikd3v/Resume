import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug, findProjectsByIds, portfolioRepoProjectIds } from "@/lib/resume-data";
import { getProjectLiveLab } from "@/lib/project-live-lab";
import { loadProjectReadme } from "@/lib/readme-loader";
import { resolveProjectEmbedUrl, resolveProjectRuntime } from "@/lib/showcase-runtime";

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
  const liveLab = project ? getProjectLiveLab(project.slug) : null;
  const readme = project ? await loadProjectReadme(project.documentationPath) : null;
  const runtime = project ? resolveProjectRuntime(project, { preferInternalLabs: false }) : null;
  const appUrl = runtime?.appUrl || "";
  const embedUrl = project && appUrl ? resolveProjectEmbedUrl(project, appUrl) : "";
  const hasEmbeddableRuntime = Boolean(embedUrl && !isKnownNonEmbeddableUrl(embedUrl));

  if (!project || !project.showcase || !liveLab) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Live App</p>
        <h1>{project.title}</h1>
        <p className="intro">{project.showcase.subhero}</p>
        <p className="muted">{project.stack.join(" • ")}</p>
        <div className="project-links">
          {appUrl ? (
            <a href={appUrl} target="_blank" rel="noreferrer">
              Open In New Tab
            </a>
          ) : null}
          {project.sourceUrl ? (
            <a href={project.sourceUrl} target="_blank" rel="noreferrer">
              Open Repository
            </a>
          ) : null}
          <Link href={`/projects/${project.slug}`} className="inline-link">
            Back To Build Page
          </Link>
        </div>
        {!appUrl ? (
          <p className="muted">
            No runtime URL is configured yet for this project. Add a public <code>SHOWCASE_*</code> URL to load the live app here.
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h2>App Runtime</h2>
        {hasEmbeddableRuntime ? (
          <iframe
            className="live-app-frame"
            src={embedUrl}
            title={`${project.title} live app`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="muted">
            This target blocks iframe embedding or is not configured for in-page playback. Use <code>Open In New Tab</code> to launch the app directly.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Objective</h2>
        <p className="section-lead">{liveLab.objective}</p>
        <h3>Architecture</h3>
        <ul className="detail-list">
          {liveLab.architecture.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Documentation Pull</h2>
        <ul className="detail-list">
          {liveLab.documentation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Implementation Snapshots</h2>
        {liveLab.implementation.map((snippet) => (
          <article key={`${snippet.path}-${snippet.title}`} className="card">
            <h3>{snippet.title}</h3>
            <p className="muted">
              <code>{snippet.path}</code>
            </p>
            <pre className="code-block">
              <code>{snippet.code}</code>
            </pre>
          </article>
        ))}
      </section>

      {readme ? (
        <section className="panel">
          <h2>README Snapshot</h2>
          <pre className="code-block">
            <code>{readme}</code>
          </pre>
        </section>
      ) : null}
    </div>
  );
}

function isKnownNonEmbeddableUrl(url: string) {
  return /github\.com|raw\.githubusercontent\.com/.test(url);
}
