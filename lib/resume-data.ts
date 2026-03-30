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
  testingAccess?: {
    username: string;
    password: string;
    scope: string;
  };
  integrationPlaceholders?: string[];
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
    id: "rick-and-morty-react",
    slug: "rick-and-morty-react",
    title: "Rick and Morty React/Next API Lookup",
    summary:
      "Portfolio project centered on the Rick and Morty API with multi-page routing, animated UI interactions, and persistent user-submitted character data.",
    stack: ["React", "Express", "MongoDB", "Multer", "Framer Motion", "Howler.js"],
    domain: ["frontend", "api", "ui", "student-project"],
    sourceUrl: "https://github.com/Icepikd3v/rick-and-morty-react",
    documentationPath: "/Users/icepik/dev/rick-and-morty-react/README.md",
    highlights: [
      "Structured the application around 4+ pages with routing and distinct user flows.",
      "Integrated Rick and Morty API search and detail exploration features.",
      "Used Framer Motion for animation and Howler.js for audio experience.",
      "Implemented server-backed user submissions with image uploads and delete support."
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
      backendUrl: "http://localhost:5051",
      startCommands: [
        "cd /Users/icepik/dev/rick-and-morty-react/server && PORT=5051 npm install && PORT=5051 npm start",
        "cd /Users/icepik/dev/rick-and-morty-react/Client/rick-and-morty-api && PORT=3103 REACT_APP_RM_API_URL=http://localhost:5051/api npm install && PORT=3103 REACT_APP_RM_API_URL=http://localhost:5051/api npm start"
      ],
      notes: "Uses a local Express + Mongo backend for auth/submissions and proxies search to Rick and Morty API."
    },
    testingAccess: {
      username: "Create account on login screen",
      password: "User-defined",
      scope: "Signup/login is handled by local backend auth."
    },
    integrationPlaceholders: [
      "Local character submissions persist in MongoDB and support image upload + delete.",
      "Search endpoint proxies requests to Rick and Morty public API through local backend.",
      "Set MONGO_URI for persistent local development data."
    ],
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
    documentationPath: "/Users/icepik/dev/icepik-octo-manager/README.md",
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
      backendUrl: "http://localhost:5052",
      startCommands: [
        "cd /Users/icepik/dev/icepik-octo-manager/App/iom-backend && PORT=5052 npm install && PORT=5052 node server.js",
        "cd /Users/icepik/dev/icepik-octo-manager/App/iom-frontend && PORT=3105 npm install && PORT=3105 npm start"
      ],
      notes: "Full-stack app with hardware-oriented OctoPrint workflow integrations."
    },
    testingAccess: {
      username: "Create account on signup page",
      password: "User-defined",
      scope: "Live auth/profile/upload flows are backed by local MongoDB API."
    },
    integrationPlaceholders: [
      "Profile edits and avatar uploads persist to MongoDB and local uploads directory.",
      "File uploads and print-job creation flow through backend APIs in live mode.",
      "Set MONGO_URI and JWT_SECRET in backend env before launching."
    ],
    theme: {
      accent: "#0ea5e9",
      accentSoft: "#f59e0b",
      surface: "rgba(15, 23, 42, 0.92)"
    }
  },
  {
    id: "ufc-mobile",
    slug: "ufc-api",
    title: "UFC Mobile (RESTful API Integration)",
    summary:
      "React Native mobile app connected to UFC REST API services for fighter management workflows including list, detail, create, update, and delete operations.",
    stack: ["React Native", "JavaScript", "Axios", "React Navigation", "REST API"],
    domain: ["mobile", "api", "crud"],
    sourceUrl: "https://github.com/Icepikd3v/ufc-mobile",
    documentationPath: "/Users/icepik/dev/ufc-mobile/README.md",
    highlights: [
      "Built cross-platform mobile UX around UFC fighter CRUD workflows.",
      "Integrated live API data flows for reading and mutating fighter records.",
      "Organized app screens for dashboard, details, add, and update operations.",
      "Connected mobile client behavior to real backend endpoint contracts."
    ],
    improvementIdeas: [
      "Add stronger client-side validation and structured error boundaries.",
      "Implement offline caching and optimistic updates for better mobile UX.",
      "Add automated end-to-end mobile test coverage for API state transitions."
    ],
    showcase: {
      hero: "UFC fighter management from mobile",
      subhero:
        "A React Native companion application wired to REST API endpoints for fighter browsing and full CRUD actions.",
      audience: "Built for users who need mobile access to fighter records and update workflows.",
      featureBlocks: [
        {
          title: "Fighter Dashboard",
          detail: "Lists fighters and routes quickly into detail, edit, and delete actions."
        },
        {
          title: "RESTful Integration",
          detail: "Uses GET/POST/PATCH/DELETE endpoint flows from the UFC backend API."
        },
        {
          title: "Mobile-First UX",
          detail: "Screen-by-screen flow optimized for handheld CRUD operations."
        }
      ]
    },
    runtime: {
      appUrl: "http://localhost:8081",
      backendUrl: "http://localhost:5053",
      startCommands: [
        "cd /Users/icepik/dev/ufc-mobile/server && PORT=5053 npm install && PORT=5053 npm start",
        "cd /Users/icepik/dev/ufc-mobile && EXPO_PUBLIC_UFC_API_URL=http://localhost:5053/api/v1 npm install && EXPO_PUBLIC_UFC_API_URL=http://localhost:5053/api/v1 npm run web"
      ],
      notes: "Runs local Express/Mongo API + React Native Expo Web app for full fighter CRUD and auth."
    },
    testingAccess: {
      username: "Create account from Signup screen",
      password: "User-defined",
      scope: "All fighter and auth actions run against local backend."
    },
    integrationPlaceholders: [
      "Set EXPO_PUBLIC_UFC_API_URL for device/emulator host-specific networking.",
      "Mongo-backed fighter records support create/update/delete per authenticated user.",
      "Backend health endpoint available at /api/v1/health."
    ],
    theme: {
      accent: "#1e88e5",
      accentSoft: "#bbdefb",
      surface: "rgba(13, 18, 28, 0.92)"
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
    projectIds: ["rick-and-morty-react", "responsive-ux-panel"]
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
  "icepik-octo-manager",
  "ufc-mobile",
  "rick-and-morty-react",
  "ready-set-travel"
];
