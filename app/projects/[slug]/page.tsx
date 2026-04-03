import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/portfolio-data";
import { getSiteContent } from "@/lib/content-store";
import { findProjectBySlug } from "@/lib/resume-data";
import { resolveProjectRuntime } from "@/lib/showcase-runtime";
import { loadProjectReadme } from "@/lib/readme-loader";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
const LOCAL_PATH_PATTERN = /\/Users\/[^/\s]+\/([^\s"'`]+)/g;

function sanitizeLocalPaths(text: string) {
  return text.replace(LOCAL_PATH_PATTERN, "/path/to/$1");
}

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
  const runtimeCommands = runtime?.startCommands.map((command) => sanitizeLocalPaths(command)) ?? [];
  const readme = detailedProject ? await loadProjectReadme(detailedProject.documentationPath) : null;
  const showcase = detailedProject?.showcase;
  const runtimeAppUrl = runtime?.appUrl;
  const runtimeIsInternalLab = Boolean(runtimeAppUrl?.startsWith("/showcase-app/"));
  const runtimeIsRepoFallback = Boolean(runtimeAppUrl && project.repo && runtimeAppUrl === project.repo);
  const showAppLink = Boolean(runtimeAppUrl && !runtimeIsRepoFallback);
  const runtimeLabel = "Open App";

  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Project Build Showcase</p>
        <h1>{project.name}</h1>
        <p className="intro">{project.summary}</p>
        <p className="muted">{project.stack.join(" • ")}</p>
        <div className="project-links">
          {project.repo ? <a href={project.repo}>Open Repository</a> : null}
          {showAppLink ? (
            <a href={runtimeAppUrl} target="_blank" rel="noreferrer">
              {runtimeLabel}
            </a>
          ) : null}
          <Link href="/" className="inline-link">
            Back to Resume Site
          </Link>
        </div>
        {runtimeIsRepoFallback ? (
          <p className="muted">
            No deployed app URL is configured yet for this project. Add a public <code>SHOWCASE_*</code> URL to enable one-click app launch here.
          </p>
        ) : null}
        {runtimeIsInternalLab ? (
          <p className="muted">
            Unified mode is enabled: this project opens as an embedded in-app runtime inside resume-site so everything ships in one deployment.
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h2>Build Info</h2>
        {showcase ? <p className="section-lead">{showcase.subhero}</p> : null}
        {detailedProject?.highlights?.length ? (
          <>
            <h3>Highlights</h3>
            <ul className="detail-list">
              {detailedProject.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
        {runtime ? (
          <>
            <h3>Run/Test Commands</h3>
            <pre className="code-block">
              <code>{runtimeCommands.join("\n")}</code>
            </pre>
            {runtime.notes ? <p className="muted">{runtime.notes}</p> : null}
          </>
        ) : null}
        {detailedProject?.testingAccess ? (
          <>
            <h3>Testing Access (Frontend Demo)</h3>
            <p className="muted">{detailedProject.testingAccess.scope}</p>
            <pre className="code-block">
              <code>{`username: ${detailedProject.testingAccess.username}\npassword: ${detailedProject.testingAccess.password}`}</code>
            </pre>
          </>
        ) : null}
        {detailedProject?.integrationPlaceholders?.length ? (
          <>
            <h3>Integration Placeholders</h3>
            <ul className="detail-list">
              {detailedProject.integrationPlaceholders.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="panel">
        <h2>README.md</h2>
        {readme ? (
          <pre className="code-block">
            <code>{readme}</code>
          </pre>
        ) : (
          <p className="muted">README content is not available for this project yet.</p>
        )}
      </section>
    </div>
  );
}
