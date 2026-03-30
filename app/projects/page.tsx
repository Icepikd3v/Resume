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
          These pages summarize implementation details, run commands, and README content.
          Use each "Open App" link to launch and test the project directly.
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
                <Link href={`/projects/${project.slug}`} className="inline-link">
                  Open Build Page
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
