import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowcaseApps } from "@/components/showcase-apps";
import { findProjectBySlug } from "@/lib/resume-data";

type Props = {
  params: Promise<{ slug: string }>;
};

const enabledSlugs = new Set([
  "icepik-octo-manager",
  "ufc-api",
  "rick-and-morty-react",
  "ready-set-travel"
]);

export default async function ShowcaseAppPage({ params }: Props) {
  const { slug } = await params;
  const project = findProjectBySlug(slug);

  if (!project || !enabledSlugs.has(slug)) {
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
        </div>
      </section>
      <section className="panel">
        <ShowcaseApps slug={slug} />
      </section>
    </div>
  );
}
