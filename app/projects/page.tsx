import Link from "next/link";
import { findProjectsByIds, portfolioRepoProjectIds } from "@/lib/resume-data";

export default function ProjectsIndexPage() {
  const repoProjects = findProjectsByIds(portfolioRepoProjectIds);

  return (
    <div className="page-shell">
      <section className="panel">
        <p className="eyebrow">Project Reviews</p>
        <h1>Repository Project Showcases</h1>
        <p className="intro">
          These pages summarize each project, the implementation stack, documented achievements,
          and a practical improvement roadmap.
        </p>
      </section>

      <section className="panel">
        <div className="grid columns-2">
          {repoProjects.map((project) => (
            <article key={project.id} className="card">
              <p className="project-tag">{project.domain.join(" • ")}</p>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <p className="muted">{project.stack.join(" • ")}</p>
              <div className="project-links">
                <Link href={`/projects/${project.slug}/live`} className="inline-link">
                  Launch Live Showcase
                </Link>
                <Link href={`/projects/${project.slug}`} className="inline-link">
                  Project Info
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
