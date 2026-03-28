export type Project = {
  slug: string;
  name: string;
  summary: string;
  stack: string[];
  repo: string;
  category: "full-stack" | "frontend" | "backend" | "api" | "hardware";
};

export const profile = {
  name: "Samuel Farmer",
  alias: "icepikd3v",
  headline: "Full Stack Web Developer | Frontend Specialist | 3D Print & Hardware Enthusiast",
  education: "B.S. in Web Design & Development - Full Sail University (Class of 2025)",
  about:
    "I build useful, user-friendly tools that connect software to real-world outcomes. From frontend experiences to backend services and hardware workflows, I focus on shipping practical systems with clean execution.",
  links: {
    github: "https://github.com/Icepikd3v",
    linkedin: "https://www.linkedin.com/in/samdev35/",
    youtube: "https://www.youtube.com/@icepikcrxsi"
  }
};

export const languageShowcase = [
  "JavaScript",
  "Python",
  "Ruby on Rails",
  "Java",
  "Go (Golang)",
  "HTML",
  "CSS",
  "Tailwind CSS"
];

export const skillGroups = [
  {
    title: "Languages",
    items: ["JavaScript", "Python", "Go", "Ruby", "Java", "HTML", "CSS", "G-code"]
  },
  {
    title: "Frameworks & Libraries",
    items: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"]
  },
  {
    title: "Databases & Tools",
    items: ["MongoDB", "Firebase", "Git", "GitHub", "AWS", "OctoPrint API", "Raspberry Pi"]
  }
];

export const projects: Project[] = [
  {
    slug: "icepik-octo-manager",
    name: "icepik-octo-manager",
    summary:
      "Multi-user 3D printing control center with OctoPrint integration, print queueing, webcam monitoring, and print history.",
    stack: ["React", "Node.js", "MongoDB", "Tailwind", "OctoPrint API"],
    repo: "https://github.com/Icepikd3v/icepik-octo-manager",
    category: "hardware"
  },
  {
    slug: "pp3-spotify",
    name: "pp3-spotify",
    summary: "Spotify API app for real-time playlist and artist exploration.",
    stack: ["React", "Express", "Spotify API", "MongoDB"],
    repo: "https://github.com/Icepikd3v/pp3-spotify",
    category: "api"
  },
  {
    slug: "ufc-api",
    name: "ufc-api",
    summary: "RESTful API for UFC event and fighter data, built using JavaScript and Express.",
    stack: ["JavaScript", "Node.js", "Express", "REST"],
    repo: "https://github.com/Icepikd3v/ufc-api",
    category: "backend"
  },
  {
    slug: "rick-and-morty-api-lookup",
    name: "Rick and Morty API Lookup",
    summary: "React/Next.js API lookup app for searching and browsing Rick and Morty character data.",
    stack: ["React", "Next.js", "JavaScript", "REST API"],
    repo: "https://github.com/Icepikd3v/rick-and-morty-react",
    category: "api"
  },
  {
    slug: "readysettravel",
    name: "ReadySetTravel",
    summary: "Mock travel agency website focused on clean frontend design and interactivity.",
    stack: ["HTML", "CSS", "Tailwind CSS", "JavaScript"],
    repo: "https://github.com/Icepikd3v/ReadySetTravel",
    category: "frontend"
  }
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
