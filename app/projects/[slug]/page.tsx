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
          {slug === "homefit-ai" ? (
            <Link href="/blog" className="inline-link">
              Read Build Blog
            </Link>
          ) : null}
        </div>
        {runtimeIsRepoFallback ? (
          <p className="muted">
            This project is currently documented as a local backend build. Use the run/test commands below to launch the API and dashboard.
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

      {detailedProject?.journal ? (
        <>
          <section className="panel capstone-journal">
            <p className="eyebrow">Capstone Journal</p>
            <h2>{detailedProject.journal.title}</h2>
            <p className="muted">
              By {detailedProject.journal.author} • {detailedProject.journal.date}
            </p>
            <p className="section-lead">{detailedProject.journal.intro}</p>
            <h3>Feature Development</h3>
            {detailedProject.journal.featureNarrative.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <section className="panel">
            <h2>Development Visuals</h2>
            <div className="journal-visual-grid">
              {detailedProject.journal.visuals.map((visual) => (
                <figure className="journal-visual-card" key={visual.src}>
                  <img src={visual.src} alt={visual.alt} />
                  <figcaption>{visual.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          {detailedProject.buildNotes?.length ? (
            <section className="panel">
              <p className="eyebrow">Backend Build Notes</p>
              <h2>How the Prototype Works</h2>
              <p className="section-lead">
                These notes translate the backend README into a portfolio-friendly walkthrough of the
                implementation, research value, and AI integration plan.
              </p>
              <div className="build-note-grid">
                {detailedProject.buildNotes.map((note) => (
                  <article className="build-note-card" key={note.title}>
                    <h3>{note.title}</h3>
                    <p>{note.body}</p>
                    {note.items?.length ? (
                      <ul className="detail-list">
                        {note.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel">
            <h2>Retrospective</h2>
            <div className="grid columns-3">
              <article className="card">
                <h3>What Went Right</h3>
                <ul className="detail-list">
                  {detailedProject.journal.retrospective.wentRight.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="card">
                <h3>What Went Wrong</h3>
                <ul className="detail-list">
                  {detailedProject.journal.retrospective.wentWrong.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="card">
                <h3>Moving Forward</h3>
                <ul className="detail-list">
                  {detailedProject.journal.retrospective.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        </>
      ) : null}

      {readme && !detailedProject?.buildNotes?.length ? (
        <section className="panel">
          <h2>README.md</h2>
          <pre className="code-block">
            <code>{readme}</code>
          </pre>
        </section>
      ) : null}
    </div>
  );
}
