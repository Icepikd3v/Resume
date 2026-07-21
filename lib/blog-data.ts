export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  projectSlug?: string;
  tags: string[];
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
  visuals: Array<{
    src: string;
    alt: string;
    caption: string;
  }>;
  retrospective: {
    wentRight: string[];
    wentWrong: string[];
    improvements: string[];
  };
};

export const blogPosts: BlogPost[] = [
  {
    slug: "homefit-ai-backend-foundation",
    title: "Building the HomeFit AI Backend Foundation",
    subtitle:
      "A first capstone journal entry on turning the proposal into a runnable backend with AI-ready data contracts.",
    author: "Samuel Farmer",
    date: "July 21, 2026",
    projectSlug: "homefit-ai",
    tags: ["HomeFit AI", "Capstone", "Backend", "FastAPI", "AI"],
    intro:
      "This month, our team moved HomeFit AI from proposal planning into a working backend foundation. Elena focused on the frontend experience while I concentrated on the API, database, and research-ready backend structure needed to support the app.",
    sections: [
      {
        title: "Feature Development",
        body: [
          "The main backend feature I developed was a FastAPI service for the HomeFit AI application. I set up health checks, Swagger documentation, exercise endpoints, workout-session endpoints, and a visible dashboard so the team and committee can quickly understand what is running.",
          "I built the backend around the needs of the future Android app. The API can seed and list supported exercises, start a workout session, add set results, complete a session, and retrieve workout history. I also added duplicate retry protection so a mobile app retry does not accidentally create the same workout set twice.",
          "Because HomeFit AI includes AI-assisted fitness features, I planned the backend contract around structured AI outputs. Camera AI can eventually send rep counts or movement estimates, while voice AI can support hands-free workout controls. The backend stores compact fields such as exercise id, repetitions, duration, source, correction status, confidence, and algorithm version, which helps the project evaluate AI usefulness without storing raw media by default."
        ]
      },
      {
        title: "Backend Build Notes",
        body: [
          "The backend stack uses Python, FastAPI, PostgreSQL, SQLAlchemy, Docker Compose, Pytest, HTTPX, and Swagger/OpenAPI. This keeps the prototype practical for local development while still being realistic enough for Android integration.",
          "The core application flow supports health checks, exercise catalog data, workout-session creation, set logging, session completion, workout history, research logging, and first-pass progression recommendations.",
          "The AI implementation plan is intentionally privacy-conscious: camera and voice features should send structured outputs to the backend rather than raw video or audio by default. That gives us a way to measure AI accuracy and usability while keeping IRB concerns front and center."
        ]
      },
      {
        title: "What I Learned",
        body: [
          "The biggest lesson this month was that backend planning is not just endpoint naming. For HomeFit AI, the backend has to support the user experience, the AI workflow, and the research study at the same time.",
          "I also learned that committee-facing evidence matters. Screenshots of a running backend, Swagger documentation, and visible data flows make the work easier to explain than code alone."
        ]
      }
    ],
    visuals: [
      {
        src: "/homefit-ai/backend-dashboard.png",
        alt: "HomeFit AI backend dashboard running locally",
        caption: "Visible backend dashboard showing the API is running and exposing core application status."
      },
      {
        src: "/homefit-ai/backend-demo-after-run.png",
        alt: "HomeFit AI backend dashboard after running API actions",
        caption: "End-to-end demo evidence after running health, sessions, research logging, and recommendations."
      },
      {
        src: "/homefit-ai/swagger-api.png",
        alt: "Swagger documentation for HomeFit AI backend API",
        caption: "Swagger/OpenAPI documentation used to review and test the backend contract."
      },
      {
        src: "/homefit-ai/database-models.png",
        alt: "HomeFit AI backend database model evidence",
        caption: "Database and model planning for exercises, workout sessions, recommendations, and research events."
      }
    ],
    retrospective: {
      wentRight: [
        "We clarified team ownership: Elena presents frontend work and I present backend work.",
        "The backend moved beyond a static demo into a runnable API with database-backed application behavior.",
        "The project now has concrete evidence for the proposal deck, README, and committee questions."
      ],
      wentWrong: [
        "Some backend dashboard visibility depended on local Docker and server state, so screenshots and README guidance became important.",
        "AI scope needed clearer explanation so reviewers understand what is implemented now versus what is planned for the final application.",
        "The team had to balance proposal documentation, IRB planning, and implementation work in the same week."
      ],
      improvements: [
        "Keep frontend and backend integration notes in one shared checklist so handoff points are easier to track.",
        "Add authentication and participant-safe identifiers before live study testing.",
        "Continue writing down assumptions, advisor feedback, and technical decisions each week so the final capstone story is easier to present."
      ]
    }
  }
];

export function findBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
