export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  domain: string[];
  liveUrl?: string;
  sourceUrl?: string;
  documentationPath?: string;
  highlights?: string[];
  improvementIdeas?: string[];
  showcase?: {
    hero: string;
    subhero: string;
    audience: string;
    featureBlocks: Array<{ title: string; detail: string }>;
  };
  runtime?: {
    appUrl: string;
    backendUrl?: string;
    startCommands: string[];
    notes?: string;
  };
  theme?: {
    accent: string;
    accentSoft: string;
    surface: string;
  };
};

export type LanguageShowcase = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  strengths: string[];
  sampleTitle: string;
  sampleCode: string;
  projectIds: string[];
};

export type MediaItem = {
  title: string;
  kind: "video" | "audio";
  description: string;
  youtubeId: string;
};

export const projects: Project[] = [
  {
    id: "pp3-spotify",
    slug: "pp3-spotify",
    title: "PP3 Spotify Music Lookup API",
    summary:
      "Full-stack Spotify search application using OAuth authentication, React frontend, and Express backend for artist/album/track exploration.",
    stack: ["React", "Node.js", "Express", "Spotify API", "MongoDB"],
    domain: ["frontend", "backend", "api", "auth"],
    sourceUrl: "https://github.com/Icepikd3v/pp3-spotify",
    documentationPath: "/Users/icepik/dev/pp3-spotify/README.md",
    highlights: [
      "Implemented Spotify OAuth login flow and session-based auth handling.",
      "Built multi-type search results for artists, albums, and tracks.",
      "Connected a React client with an Express API server for end-to-end functionality.",
      "Designed a responsive dark-themed UI for desktop and mobile users."
    ],
    improvementIdeas: [
      "Add rate-limit and caching strategy for Spotify API requests.",
      "Introduce typed API contracts and central error boundaries.",
      "Add integration tests around auth callback and search endpoints."
    ],
    showcase: {
      hero: "Music discovery with secure Spotify authentication",
      subhero:
        "A full-stack build where users authenticate, search artists/albums/tracks, and launch results directly in Spotify.",
      audience: "Built for music fans who want fast, focused lookup without friction.",
      featureBlocks: [
        {
          title: "OAuth Login",
          detail: "Implements Spotify authentication flow with secure session handling."
        },
        {
          title: "Search Experience",
          detail: "Supports artist, album, and track lookups with clear grouped results."
        },
        {
          title: "Split Architecture",
          detail: "React frontend + Express backend to demonstrate end-to-end integration."
        }
      ]
    },
    runtime: {
      appUrl: "http://localhost:3101",
      backendUrl: "http://localhost:3001",
      startCommands: [
        "cd /Users/icepik/dev/pp3-spotify/server && PORT=3001 npm install && PORT=3001 npm start",
        "cd /Users/icepik/dev/pp3-spotify/client/spotify && PORT=3101 npm install && PORT=3101 npm start"
      ],
      notes: "Runs as React frontend + Express backend with Spotify OAuth/API integration."
    },
    theme: {
      accent: "#1db954",
      accentSoft: "#7fffb4",
      surface: "rgba(18, 18, 18, 0.92)"
    }
  },
  {
    id: "rick-and-morty-react",
    slug: "rick-and-morty-react",
    title: "Rick and Morty React/Next API Lookup",
    summary:
      "Portfolio project centered on the Rick and Morty API with multi-page routing, animated UI interactions, and persistent user-submitted character data.",
    stack: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Howler.js", "LocalStorage"],
    domain: ["frontend", "api", "ui", "student-project"],
    sourceUrl: "https://github.com/Icepikd3v/rick-and-morty-react",
    documentationPath: "/Users/icepik/dev/rick-and-morty-react/README.md",
    highlights: [
      "Structured the application around 4+ pages with routing and distinct user flows.",
      "Integrated Rick and Morty API search and detail exploration features.",
      "Used Framer Motion for animation and Howler.js for audio experience.",
      "Implemented local persistence for user-submitted character entries."
    ],
    improvementIdeas: [
      "Finalize consistent Next.js app structure and deployment config.",
      "Add server-backed moderation for submitted character content.",
      "Improve component reuse and automated accessibility checks."
    ],
    showcase: {
      hero: "Rick and Morty universe explorer",
      subhero:
        "A multi-page React/Next-style experience featuring API search, animated transitions, and persistent community submissions.",
      audience: "Built for fans who want searchable character data and interactive themed UX.",
      featureBlocks: [
        {
          title: "API-Powered Search",
          detail: "Queries character data and presents detail-focused browsing flows."
        },
        {
          title: "Motion + Audio",
          detail: "Uses Framer Motion and Howler.js for a more immersive fan experience."
        },
        {
          title: "Persistent Submissions",
          detail: "Stores user-submitted entries using local persistence strategies."
        }
      ]
    },
    runtime: {
      appUrl: "http://localhost:3103",
      startCommands: [
        "cd /Users/icepik/dev/rick-and-morty-react/Client/rick-and-morty-api && PORT=3103 npm install && PORT=3103 npm start"
      ],
      notes: "Uses Rick and Morty API, framer-motion animations, and howler audio."
    },
    theme: {
      accent: "#84f729",
      accentSoft: "#9be7ff",
      surface: "rgba(8, 16, 32, 0.9)"
    }
  },
  {
    id: "icepikd3v-profile",
    slug: "icepikd3v-profile",
    title: "Icepikd3v GitHub Profile README",
    summary:
      "Central developer identity page that presents core tech stack, featured repositories, and your cross-discipline focus in software + hardware.",
    stack: ["Markdown", "GitHub Profile", "Portfolio Branding"],
    domain: ["branding", "documentation", "career"],
    sourceUrl: "https://github.com/Icepikd3v",
    documentationPath: "/Users/icepik/Desktop/Icepikd3v/README.md",
    highlights: [
      "Establishes a clear full-stack + 3D hardware positioning narrative.",
      "Curates key projects into a single recruiter-friendly entry point.",
      "Includes education, achievement, and active roadmap context."
    ],
    improvementIdeas: [
      "Add pinned live demo links for each featured repository.",
      "Include architecture thumbnails/screenshots for top projects.",
      "Add short metrics section (users, deployments, build stats)."
    ],
    showcase: {
      hero: "Developer profile hub and portfolio identity",
      subhero:
        "A structured GitHub profile README that tells your story, stack, and top builds in one recruiter-friendly destination.",
      audience: "Designed for recruiters, collaborators, and clients evaluating your technical range.",
      featureBlocks: [
        {
          title: "Identity Layer",
          detail: "Presents your full-stack + 3D print/hardware blend as a unique value proposition."
        },
        {
          title: "Curated Projects",
          detail: "Highlights flagship repositories with direct context and technology framing."
        },
        {
          title: "Career Readiness",
          detail: "Includes education, honors, and current roadmap to show momentum."
        }
      ]
    },
    runtime: {
      appUrl: "https://github.com/Icepikd3v",
      startCommands: ["Open the GitHub profile README directly as the live source of truth."],
      notes: "This project is documentation-first and intentionally hosted on GitHub profile."
    },
    theme: {
      accent: "#58a6ff",
      accentSoft: "#c9d1d9",
      surface: "rgba(13, 17, 23, 0.9)"
    }
  },
  {
    id: "ready-set-travel",
    slug: "ready-set-travel",
    title: "ReadySetTravel",
    summary:
      "School mock travel webpage focused on frontend structure, multi-page layout, responsive design practice, and Tailwind/CSS workflow growth.",
    stack: ["HTML", "CSS", "Tailwind CSS", "Responsive Design"],
    domain: ["frontend", "ui", "student-project"],
    sourceUrl: "https://github.com/Icepikd3v/ReadySetTravel",
    documentationPath: "/Users/icepik/dev/ReadySetTravel/README.md",
    highlights: [
      "Built multiple content pages including destinations, tours, and blogs.",
      "Improved responsiveness and layout control across milestone iterations.",
      "Refactored styling approach with practical Tailwind adoption."
    ],
    improvementIdeas: [
      "Migrate static pages into reusable Next.js components.",
      "Add semantic SEO metadata and performance budgets.",
      "Integrate booking inquiry form with validation and backend endpoint."
    ],
    showcase: {
      hero: "Travel mock site focused on frontend craft",
      subhero:
        "A school project that evolved through responsive layout iteration, multi-page structure, and style system refactoring.",
      audience: "Built as a polished mock travel brand experience and UI practice platform.",
      featureBlocks: [
        {
          title: "Multi-Page Structure",
          detail: "Includes homepage, destinations, tours, blogs, and supporting sections."
        },
        {
          title: "Responsive Practice",
          detail: "Iterative improvements to grids, spacing, and mobile behavior."
        },
        {
          title: "Tailwind Adoption",
          detail: "Refactored styling approach to improve speed and consistency."
        }
      ]
    },
    runtime: {
      appUrl: "http://localhost:3104",
      startCommands: [
        "cd /Users/icepik/dev/ReadySetTravel/dev/readysettravel && python3 -m http.server 3104"
      ],
      notes: "Static multi-page travel site powered by HTML/CSS/Tailwind CDN."
    },
    theme: {
      accent: "#f97316",
      accentSoft: "#38bdf8",
      surface: "rgba(17, 24, 39, 0.9)"
    }
  },
  {
    id: "icepik-octo-manager",
    slug: "icepik-octo-manager",
    title: "Icepik Octo Manager",
    summary:
      "B.S. final project: a multi-user 3D printing management platform with OctoPrint integration, queue control, role-based access, and analytics tracking.",
    stack: ["Node.js", "React", "Tailwind CSS", "MongoDB", "OctoPrint API"],
    domain: ["full-stack", "hardware", "analytics", "auth"],
    sourceUrl: "https://github.com/Icepikd3v/icepik-octo-manager",
    documentationPath: "/Users/icepik/dev/icepik-octo-manager/docs/log.md",
    highlights: [
      "Designed around multi-user print queue and job lifecycle management.",
      "Implemented admin analytics endpoints and CSV export workflows.",
      "Integrated route protection, role checks, and milestone-driven delivery.",
      "Combined software product workflows with 3D FDM hardware operations."
    ],
    improvementIdeas: [
      "Add production deployment blueprint for Raspberry Pi + cloud relay.",
      "Implement print-cost estimator, filament inventory, and failure prediction.",
      "Harden auth/session handling and add comprehensive end-to-end tests."
    ],
    showcase: {
      hero: "Multi-user 3D print operations platform",
      subhero:
        "A capstone full-stack system combining OctoPrint hardware control with user management, analytics, and job lifecycle workflows.",
      audience: "Built for makerspaces, labs, and teams managing shared FDM printer operations.",
      featureBlocks: [
        {
          title: "Queue + Job Control",
          detail: "Tracks print jobs across states like start, pause, resume, cancel, and ship."
        },
        {
          title: "Admin Analytics",
          detail: "Provides admin-only summaries and CSV export for operational reporting."
        },
        {
          title: "Role-Based Access",
          detail: "Secures routes and actions with user roles and protected workflows."
        }
      ]
    },
    runtime: {
      appUrl: "http://localhost:3105",
      backendUrl: "http://localhost:5000",
      startCommands: [
        "cd /Users/icepik/dev/icepik-octo-manager/App/iom-backend && PORT=5000 npm install && PORT=5000 node server.js",
        "cd /Users/icepik/dev/icepik-octo-manager/App/iom-frontend && PORT=3105 npm install && PORT=3105 npm start"
      ],
      notes: "Full-stack app with hardware-oriented OctoPrint workflow integrations."
    },
    theme: {
      accent: "#0ea5e9",
      accentSoft: "#f59e0b",
      surface: "rgba(15, 23, 42, 0.92)"
    }
  },
  {
    id: "sales-pipeline-command-center",
    slug: "sales-pipeline-command-center",
    title: "Sales Pipeline Command Center",
    summary:
      "Automates lead routing and pipeline movement with CRM webhooks, role-based workflows, and reporting metrics.",
    stack: ["Python", "PostgreSQL", "Webhooks", "REST API"],
    domain: ["backend", "crm", "database"]
  },
  {
    id: "inventory-api-platform",
    slug: "inventory-api-platform",
    title: "Inventory API Platform",
    summary:
      "Backend service for inventory and warehouse operations with secure endpoints and migration-backed schema changes.",
    stack: ["Java", "MySQL", "Auth", "Service Architecture"],
    domain: ["backend", "database"]
  },
  {
    id: "workflow-orchestrator",
    slug: "workflow-orchestrator",
    title: "Workflow Orchestrator",
    summary:
      "Retry-safe automation engine coordinating support and CRM sync tasks through background processing.",
    stack: ["Ruby", "Jobs", "Integrations"],
    domain: ["backend", "crm"]
  },
  {
    id: "pipeline-metrics-lab",
    slug: "pipeline-metrics-lab",
    title: "Pipeline Metrics Lab",
    summary:
      "SQL analytics workspace for conversion, velocity, and attribution dashboards across business stages.",
    stack: ["SQL", "PostgreSQL", "BI"],
    domain: ["database", "analytics"]
  },
  {
    id: "responsive-ux-panel",
    slug: "responsive-ux-panel",
    title: "Responsive UX Panel",
    summary:
      "Responsive interface shell with utility classes, adaptive layouts, and interaction polish for dashboard products.",
    stack: ["HTML", "CSS", "JavaScript"],
    domain: ["frontend"]
  }
];

export const languageShowcases: LanguageShowcase[] = [
  {
    slug: "javascript",
    name: "JavaScript",
    tagline: "Interactive UI and API-driven features",
    summary:
      "JavaScript is where rapid product iteration happens: components, API integrations, and high-velocity UX changes.",
    strengths: ["React interfaces", "REST fetch layers", "State orchestration", "Runtime validation"],
    sampleTitle: "Dashboard transformer",
    sampleCode: `export const toDashboardCard = (lead) => ({\n  id: lead.id,\n  owner: lead.owner,\n  stage: lead.stage,\n  updatedAt: new Date(lead.updatedAt).toLocaleDateString()\n});`,
    projectIds: ["pp3-spotify", "rick-and-morty-react", "responsive-ux-panel"]
  },
  {
    slug: "python",
    name: "Python",
    tagline: "Automation, scoring, and backend utilities",
    summary:
      "Python is ideal for workflow automation, data shaping, and service-side logic that needs to stay clear and maintainable.",
    strengths: ["Business logic", "Automation scripts", "Data processing", "API services"],
    sampleTitle: "CRM lead scoring",
    sampleCode: `def score_lead(profile):\n    score = 0\n    if profile.get("company_size", 0) > 50:\n        score += 35\n    if profile.get("engagement") == "high":\n        score += 45\n    if profile.get("budget"):\n        score += 20\n    return min(score, 100)`,
    projectIds: ["sales-pipeline-command-center"]
  },
  {
    slug: "java",
    name: "Java",
    tagline: "Structured service architecture",
    summary:
      "Java supports robust API platforms where reliability, typed models, and layered architecture are core requirements.",
    strengths: ["Service boundaries", "Typed contracts", "Auth and policies", "Enterprise integrations"],
    sampleTitle: "Request result model",
    sampleCode: `public record ApiResult(int status, String message) {}\n\npublic ApiResult validateRequest(boolean authorized) {\n    return authorized\n        ? new ApiResult(200, "Request accepted")\n        : new ApiResult(401, "Unauthorized");\n}`,
    projectIds: ["inventory-api-platform"]
  },
  {
    slug: "ruby",
    name: "Ruby",
    tagline: "Workflow orchestration and business process code",
    summary:
      "Ruby helps ship automation fast, especially for background jobs and glue-code across APIs and data systems.",
    strengths: ["Background workers", "Task queues", "Integration adapters", "Readable domain code"],
    sampleTitle: "Retry-safe orchestrator",
    sampleCode: `class WorkflowOrchestrator\n  def call(task)\n    with_retries(max: 3) do\n      sync_crm(task)\n      log_success(task.id)\n    end\n  end\nend`,
    projectIds: ["workflow-orchestrator"]
  },
  {
    slug: "sql",
    name: "SQL",
    tagline: "Data modeling and analytics",
    summary:
      "SQL turns raw activity into decision-grade reporting through schema design, indexing, and tuned query composition.",
    strengths: ["Schema planning", "Performance tuning", "Analytics queries", "Reporting pipelines"],
    sampleTitle: "Pipeline conversion view",
    sampleCode: `SELECT stage,\n       COUNT(*) AS total_leads,\n       ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(*), 2) AS conversion_rate\nFROM crm_pipeline\nGROUP BY stage\nORDER BY conversion_rate DESC;`,
    projectIds: ["pipeline-metrics-lab"]
  },
  {
    slug: "css",
    name: "CSS",
    tagline: "Visual systems and responsive UI",
    summary:
      "CSS is used as a design language: tokens, component surfaces, and responsive structure for polished product UX.",
    strengths: ["Design systems", "Responsive layouts", "Motion and transitions", "Visual hierarchy"],
    sampleTitle: "Responsive panel shell",
    sampleCode: `.panel-grid {\n  display: grid;\n  gap: 1rem;\n  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\n}\n\n.panel-card {\n  border: 1px solid var(--surface-border);\n  border-radius: 16px;\n  background: var(--surface);\n}`,
    projectIds: ["ready-set-travel", "responsive-ux-panel"]
  }
];

export const mediaShowcase: MediaItem[] = [
  {
    title: "Engineering Walkthrough",
    kind: "video",
    description: "Portfolio walkthrough showing architecture choices and build strategy.",
    youtubeId: "dQw4w9WgXcQ"
  },
  {
    title: "Live Coding Session",
    kind: "video",
    description: "Feature build timelapse covering frontend + backend implementation.",
    youtubeId: "M7lc1UVf-VE"
  },
  {
    title: "Developer Podcast Clip",
    kind: "audio",
    description: "Audio-first YouTube interview on systems thinking and product delivery.",
    youtubeId: "aqz-KE-bpKQ"
  }
];

export const siteMeta = {
  name: "Samuel Farmer",
  title: "Full-Stack Developer Resume Portfolio",
  tagline: "Frontend to backend to database, with multilingual engineering depth."
};

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Languages", href: "/#languages" },
  { label: "Media", href: "/#media" }
];

export function findLanguageBySlug(slug: string) {
  return languageShowcases.find((language) => language.slug === slug);
}

export function findProjectsByIds(ids: string[]) {
  return ids
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project));
}

export function findProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export const portfolioRepoProjectIds = [
  "pp3-spotify",
  "rick-and-morty-react",
  "icepikd3v-profile",
  "ready-set-travel",
  "icepik-octo-manager"
];
