import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/portfolio-data";
import { getSiteContent } from "@/lib/content-store";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project =
    content.featuredProjects.find((entry) => entry.slug === slug) ||
    getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="panel hero">
        <p className="eyebrow">Project Showcase</p>
        <h1>{project.name}</h1>
        <p className="intro">{project.summary}</p>
        <p className="muted">{project.stack.join(" • ")}</p>
        <div className="project-links">
          <a href={project.repo}>Open Repository</a>
          <Link href="/" className="inline-link">
            Back to Resume Site
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>Why This Matters</h2>
        <p>
          This project demonstrates practical capability in {project.category} systems, real-world
          implementation patterns, and production-minded development.
        </p>
      </section>
    </div>
  );
}
