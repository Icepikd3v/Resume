import { promises as fs } from "node:fs";
import path from "node:path";
import { projects as defaultProjects } from "@/lib/portfolio-data";

export type MediaItem = {
  src: string;
  label: string;
};

export type FeaturedProject = {
  slug: string;
  name: string;
  summary: string;
  stack: string[];
  repo: string;
  category: string;
};

export type LiveSite = {
  name: string;
  url: string;
  description: string;
};

export type VideoItem = {
  title: string;
  embedUrl: string;
};

export type SiteContent = {
  name: string;
  alias: string;
  headline: string;
  about: string;
  contacts: string[];
  socialLinks: {
    github: string;
    linkedin: string;
  };
  featuredProjects: FeaturedProject[];
  portraits: MediaItem[];
  printGallery: MediaItem[];
  liveSites: LiveSite[];
  tutorialVideos: VideoItem[];
  projectVideos: VideoItem[];
  printTimelapseVideos: VideoItem[];
};

const CONTENT_PATH = path.join(process.cwd(), "data", "site-content.json");

const fallbackContent: SiteContent = {
  name: "Samuel Farmer",
  alias: "Icepikd3v",
  headline: "Full Stack Web Developer | Frontend Specialist | 3D Print & Hardware Enthusiast",
  about:
    "I love building useful, user-friendly tools-especially ones that connect software to real-world hardware. I bring a creative, hands-on mindset to every project, whether I'm wiring up a Raspberry Pi, refining a front-end UI, or managing complex print queues.",
  contacts: ["sam.d3v.35@gmail.com", "icepik09@gmail.com"],
  socialLinks: {
    github: "https://github.com/Icepikd3v",
    linkedin: "https://www.linkedin.com/in/samdev35/"
  },
  featuredProjects: defaultProjects.map((project) => ({ ...project })),
  portraits: [
    { src: "/ME/SelfieSuit.jpg", label: "SelfieSuit" },
    { src: "/ME/GradMe.jpg", label: "GradMe" },
    { src: "/ME/Casualme.jpg", label: "CasualMe" },
    { src: "/ME/AiMe.jpg", label: "AiME" }
  ],
  printGallery: [
    { src: "/Print%20Pics/OctoprintDash.jpg", label: "OctoPrint Dashboard" },
    { src: "/Print%20Pics/Printers1.jpg", label: "Printer Setup 1" },
    { src: "/Print%20Pics/Printers2.jpg", label: "Printer Setup 2" },
    { src: "/Print%20Pics/FlexiDragon.jpg", label: "Flexi Dragon Print" },
    { src: "/Print%20Pics/UFC%20Octagon.jpg", label: "UFC Octagon Build" },
    { src: "/Print%20Pics/ClearPLARocket.jpg", label: "Clear PLA Rocket" },
    { src: "/Print%20Pics/TPU%20Cuzzy.jpg", label: "TPU Print" },
    { src: "/Print%20Pics/Creality%20LaserEngraving.jpg", label: "Laser Engraving" },
    { src: "/Print%20Pics/PrintPile1.jpg", label: "Print Collection" }
  ],
  liveSites: [
    {
      name: "MyBrothersFinds",
      url: "https://www.mybrothersfinds.com",
      description: "Side project for storage, vintage, and used goods resale."
    },
    {
      name: "Elysium Mall",
      url: "https://www.elysiummall.com",
      description: "Current employer project and active production site."
    }
  ],
  tutorialVideos: [
    { title: "TutorSparkCLI Walkthrough", embedUrl: "" },
    { title: "TutorSpark CLI UnitTesting", embedUrl: "" },
    { title: "TutorSparkCLI Milestone 1&2", embedUrl: "" },
    { title: "TutorSpark CLI basic", embedUrl: "" },
    { title: "DataVisualization Presentation", embedUrl: "" },
    { title: "JMeter Stress Testing", embedUrl: "" },
    { title: "Shell Script Newman Testing&Report", embedUrl: "" },
    { title: "LoadTesting POSTMAN", embedUrl: "" },
    { title: "Selenium Testing", embedUrl: "" },
    { title: "Integration Testing POSTMAN", embedUrl: "" },
    { title: "Unit Testing", embedUrl: "" },
    { title: "Auth0 Flow Progress code", embedUrl: "" },
    { title: "API Testing Assignment", embedUrl: "" },
    { title: "Space Object Library API", embedUrl: "" },
    { title: "RESTful Routes using Express.js", embedUrl: "" },
    { title: "Docker Tutorial Building Images in many Languages", embedUrl: "" },
    { title: "Framer-Motion Library Tutorial", embedUrl: "" },
    { title: "HackerRank Challenge", embedUrl: "" },
    { title: "Full-Stack Build Test", embedUrl: "" },
    { title: "Unit Testing API using POSTMAN", embedUrl: "" },
    { title: "Mongo Testing Assignment", embedUrl: "" },
    { title: "NodeJS Unit Testing", embedUrl: "" }
  ],
  projectVideos: [
    { title: "Icepik's Octo Manager Brief Sample", embedUrl: "" },
    { title: "UFC-ApiMobile", embedUrl: "" },
    { title: "Rick and Morty React (Front-End)", embedUrl: "" }
  ],
  printTimelapseVideos: [
    { title: "Flexi-Elephants", embedUrl: "" },
    { title: "The Thwacker", embedUrl: "" },
    { title: "T-Flex", embedUrl: "" },
    { title: "E3 Farm 1st Year Compilation", embedUrl: "" }
  ]
};

function normalizeMedia(input: unknown, fallback: MediaItem[]) {
  if (!Array.isArray(input)) return fallback;
  const items = input
    .map((entry) => {
      const row = entry as Partial<MediaItem>;
      return {
        src: String(row.src || "").trim(),
        label: String(row.label || "").trim()
      };
    })
    .filter((item) => item.src && item.label);
  return items.length ? items : fallback;
}

function normalizeProjects(input: unknown, fallback: FeaturedProject[]) {
  if (!Array.isArray(input)) return fallback;
  const rows = input
    .map((entry) => {
      const row = entry as Partial<FeaturedProject>;
      const stack = Array.isArray(row.stack)
        ? row.stack.map((item) => String(item).trim()).filter(Boolean)
        : [];

      return {
        slug: String(row.slug || "").trim(),
        name: String(row.name || "").trim(),
        summary: String(row.summary || "").trim(),
        stack,
        repo: String(row.repo || "").trim(),
        category: String(row.category || "project").trim() || "project"
      };
    })
    .filter((row) => row.slug && row.name && row.summary && row.repo);

  return rows.length ? rows : fallback;
}

function normalizeLiveSites(input: unknown, fallback: LiveSite[]) {
  if (!Array.isArray(input)) return fallback;
  const rows = input
    .map((entry) => {
      const row = entry as Partial<LiveSite>;
      return {
        name: String(row.name || "").trim(),
        url: String(row.url || "").trim(),
        description: String(row.description || "").trim()
      };
    })
    .filter((row) => row.name && row.url);
  return rows.length ? rows : fallback;
}

function normalizeVideos(input: unknown, fallback: VideoItem[]) {
  if (!Array.isArray(input)) return fallback;
  const rows = input
    .map((entry) => {
      const row = entry as Partial<VideoItem>;
      return {
        title: String(row.title || "").trim(),
        embedUrl: String(row.embedUrl || "").trim()
      };
    })
    .filter((row) => row.title);
  return rows.length ? rows : fallback;
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;

    return {
      name: parsed.name || fallbackContent.name,
      alias: parsed.alias || fallbackContent.alias,
      headline: parsed.headline || fallbackContent.headline,
      about: parsed.about || fallbackContent.about,
      contacts: parsed.contacts?.map((item) => String(item).trim()).filter(Boolean) || fallbackContent.contacts,
      socialLinks: {
        github: parsed.socialLinks?.github?.trim() || fallbackContent.socialLinks.github,
        linkedin: parsed.socialLinks?.linkedin?.trim() || fallbackContent.socialLinks.linkedin
      },
      featuredProjects: normalizeProjects(parsed.featuredProjects, fallbackContent.featuredProjects),
      portraits: normalizeMedia(parsed.portraits, fallbackContent.portraits),
      printGallery: normalizeMedia(parsed.printGallery, fallbackContent.printGallery),
      liveSites: normalizeLiveSites(parsed.liveSites, fallbackContent.liveSites),
      tutorialVideos: normalizeVideos(parsed.tutorialVideos, fallbackContent.tutorialVideos),
      projectVideos: normalizeVideos(parsed.projectVideos, fallbackContent.projectVideos),
      printTimelapseVideos: normalizeVideos(parsed.printTimelapseVideos, fallbackContent.printTimelapseVideos)
    };
  } catch {
    return fallbackContent;
  }
}

export async function saveSiteContent(input: SiteContent): Promise<void> {
  const normalized: SiteContent = {
    name: input.name.trim(),
    alias: input.alias.trim(),
    headline: input.headline.trim(),
    about: input.about.trim(),
    contacts: input.contacts.map((item) => item.trim()).filter(Boolean),
    socialLinks: {
      github: input.socialLinks.github.trim(),
      linkedin: input.socialLinks.linkedin.trim()
    },
    featuredProjects: input.featuredProjects
      .map((project) => ({
        slug: project.slug.trim(),
        name: project.name.trim(),
        summary: project.summary.trim(),
        stack: project.stack.map((item) => item.trim()).filter(Boolean),
        repo: project.repo.trim(),
        category: project.category.trim() || "project"
      }))
      .filter((project) => project.slug && project.name && project.summary && project.repo),
    portraits: input.portraits
      .map((item) => ({ src: item.src.trim(), label: item.label.trim() }))
      .filter((item) => item.src && item.label),
    printGallery: input.printGallery
      .map((item) => ({ src: item.src.trim(), label: item.label.trim() }))
      .filter((item) => item.src && item.label),
    liveSites: input.liveSites
      .map((site) => ({
        name: site.name.trim(),
        url: site.url.trim(),
        description: site.description.trim()
      }))
      .filter((site) => site.name && site.url),
    tutorialVideos: input.tutorialVideos
      .map((video) => ({
        title: video.title.trim(),
        embedUrl: video.embedUrl.trim()
      }))
      .filter((video) => video.title),
    projectVideos: input.projectVideos
      .map((video) => ({
        title: video.title.trim(),
        embedUrl: video.embedUrl.trim()
      }))
      .filter((video) => video.title),
    printTimelapseVideos: input.printTimelapseVideos
      .map((video) => ({
        title: video.title.trim(),
        embedUrl: video.embedUrl.trim()
      }))
      .filter((video) => video.title)
  };

  await fs.writeFile(CONTENT_PATH, JSON.stringify(normalized, null, 2));
}
