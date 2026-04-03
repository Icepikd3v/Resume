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

function resolveProjectSlug(slug: string) {
  const canonicalSlug = projectSlugAliases[slug] || slug;
  return findProjectBySlug(canonicalSlug) ? canonicalSlug : null;
}

export async function generateStaticParams() {
  const repoProjects = findProjectsByIds(portfolioRepoProjectIds);
  return repoProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalSlug = resolveProjectSlug(slug);

  if (!canonicalSlug) {
    return { title: "Project Live Showcase" };
  }

  const project = findProjectBySlug(canonicalSlug);

  return {
    title: `${project?.title || "Project"} | Live App`,
    description: project?.showcase?.subhero || "Launch the embedded live app runtime."
  };
}

export default async function ProjectLiveShowcaseRedirectPage({ params }: Props) {
  const { slug } = await params;
  const canonicalSlug = resolveProjectSlug(slug);
  if (!canonicalSlug) notFound();
  redirect(`/showcase-app/${canonicalSlug}`);
}
