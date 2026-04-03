import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug } from "@/lib/resume-data";
import { ShowcaseRouteAlert } from "@/components/showcase-route-alert";

type Props = {
  params: Promise<{ slug: string }>;
};

const enabledSlugs = new Set([
  "icepik-octo-manager",
  "ufc-api",
  "rick-and-morty-react",
  "ready-set-travel"
]);
const embeddedPathBySlug: Record<string, string> = {
  "icepik-octo-manager": "/embedded/icepik-octo-manager/index.html",
  "ufc-api": "/embedded/ufc-api/index.html",
  "rick-and-morty-react": "/embedded/rick-and-morty-react/index.html",
  "ready-set-travel": "/embedded/ready-set-travel/index.html"
};
const appHintBySlug: Partial<Record<string, string>> = {
  "icepik-octo-manager":
    "Heads up: if the app opens on a Not Found screen, click Home in the embedded app to continue.",
  "rick-and-morty-react":
    "Heads up: if the app opens on a Not Found screen, click Home in the embedded app to continue."
};

export default async function ShowcaseAppPage({ params }: Props) {
  const { slug } = await params;
  const project = findProjectBySlug(slug);
  const embeddedPath = embeddedPathBySlug[slug];
  const appHint = appHintBySlug[slug];

  if (!project || !enabledSlugs.has(slug) || !embeddedPath) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="panel">
        <div className="project-links">
          <Link href={`/projects/${slug}`} className="inline-link">
            Back To Build Page
          </Link>
          {project.sourceUrl ? (
            <a href={project.sourceUrl} target="_blank" rel="noreferrer">
              Open Repository
            </a>
          ) : null}
          <a href={embeddedPath} target="_blank" rel="noreferrer">
            Open App In New Tab
          </a>
        </div>
      </section>
      <section className="panel">
        {appHint ? <p className="app-route-alert">{appHint}</p> : null}
        {appHint ? (
          <ShowcaseRouteAlert message={appHint} storageKey={`showcase-alert-seen:${slug}`} />
        ) : null}
        <iframe
          className="live-app-frame"
          src={embeddedPath}
          title={`${project.title} embedded app`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
