import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { findProjectBySlug, findProjectsByIds, portfolioRepoProjectIds } from "@/lib/resume-data";

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

  redirect(`/projects/${project.slug}`);
}
