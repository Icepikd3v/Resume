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
    slug: "homefit-ai-on-device-pose-tracking",
    title: "Profiling Before Optimizing: On-Device Pose Tracking in HomeFit AI 1.1",
    subtitle:
      "How measuring the app on a real phone changed what I fixed, and why the code I assumed was slow turned out to be 0.01% of the workload.",
    author: "Samuel Farmer",
    date: "August 30, 2026",
    projectSlug: "homefit-ai",
    tags: ["HomeFit AI", "Capstone", "Android", "Performance", "ML Kit"],
    intro:
      "Last month HomeFit AI was a backend with no camera attached to it. This month it became an app you can actually stand in front of. I shipped version 1.1 to a physical device, wired CameraX into Google ML Kit for on-device pose detection, and then measured the whole thing instead of guessing at it. The measuring is the part that changed my mind about what to build next.",
    sections: [
      {
        title: "Feature Development",
        body: [
          "The goal for August was real-time exercise tracking running on a phone, fast enough to run a usability study on top of. That second half matters more than it sounds. Our capstone study measures how long a participant takes to complete a task, so if the camera pipeline made the interface stutter we would be measuring our own bug rather than our interface, and every task time we collected would be worthless.",
          "The core feature is a camera screen that streams frames to ML Kit, receives 33 skeletal landmarks per frame, and reduces them to six joint angles. The app never stores landmarks or images. It keeps a running minimum, maximum, and mean per joint and uploads only that summary when a set is saved. That was a deliberate privacy decision made with the IRB submission in mind, and it has the side effect of keeping memory pressure almost flat.",
          "I also added a developer screen behind a build flag. It reports frames captured, detection rate, heap usage, workouts stored locally, and whether the last sync succeeded. Reading the device is far faster than attaching a debugger, and it caught two problems I would otherwise have missed. It ships disabled in the build participants receive.",
          "The rest of the month was unglamorous repair work found by testing on the actual phone: the Workout tab rendered nothing, action buttons sat underneath the system navigation bar, height and weight were dropdowns when they should have been typed input, and several labels overlapped on a narrow screen."
        ]
      },
      {
        title: "Performance Build Notes",
        body: [
          "The stack for this month was CameraX, Google ML Kit pose detection, Jetpack Compose, AndroidX Macrobenchmark, and simpleperf, the sampling profiler behind Android Studio's CPU Profiler. Everything was measured on a physical motorola razr 2023 running Android 15, on a non-debuggable build, because a debuggable build disables runtime optimization and would not describe what a user experiences.",
          "Pose detection costs about 129% of one core while a set is running. On an eight-core phone that is roughly 16% of the device, and it holds steady across a full minute with temperature never rising more than one degree. Idle cost is genuinely zero, because nothing polls between sets.",
          "Profiling also found the real bug. The camera screen was constructing a new executor and a new ML Kit detector on every Compose recomposition and releasing neither, so a long session quietly accumulated detector instances holding native resources and threads. Both are now created once and released deterministically when the screen goes away, along with the CameraX binding. I also moved the frame release onto the completion path so a frame is freed whether detection succeeds or fails, because failing to release on the error path stalls the pipeline entirely. Memory now holds a stable ceiling across three independent runs with no upward drift, which is the evidence the fix took."
        ]
      },
      {
        title: "What I Learned",
        body: [
          "The lesson of the month came from one number. Sampling at 1 kHz for 30 seconds produced 39,662 samples. ML Kit's native detector accounted for 72% of them, with the neural-network kernels alone at 57% and image preprocessing at 13%. My own Kotlin — the angle math, the landmark filtering, the frame handling I had assumed was the expensive part — came to 0.01%.",
          "I had been planning to optimize the angle computation. Optimizing it could not have produced a measurable gain, and no amount of reading the code would have told me that. The only reducible slice is the 13% spent rotating and converting frames before inference, which is a resolution and rotation setting rather than a rewrite. Profile first, then optimize, is advice I had heard and not actually followed until it cost me three weeks of misplaced planning.",
          "A second surprise changed the study rather than the code. Detection throughput varied between runs and the obvious explanation was battery level. That explanation is wrong: the slower run was at a higher charge than the faster one, and CPU cost was identical across all three. What varied was how many frames produced usable landmarks, which comes down to framing and lighting. Camera placement and distance now have to be fixed for every participant, or we will collect pose data of differing density and not know why.",
          "Elena ran the first usability sessions and her findings lined up with what the device measurements implied. Participants reported needing several taps to move between input fields, the save button disappearing behind the keyboard, and the camera not starting. Each maps to a specific defect rather than to a preference, so they are fixable rather than debatable."
        ]
      }
    ],
    visuals: [
      {
        src: "/homefit-ai/v11-workout-history.png",
        alt: "HomeFit AI workout history showing five camera-tracked squat sets",
        caption:
          "The repaired Workout tab listing camera-tracked sets with frame counts, and the navigation row now clear of the system bar."
      },
      {
        src: "/homefit-ai/v11-developer-screen.png",
        alt: "In-app developer screen reporting detection rate and heap usage",
        caption:
          "The developer screen reading 13.8 detections per second over a 101-second set, with heap and sync status visible on the device."
      },
      {
        src: "/homefit-ai/v11-pose-flamegraph.png",
        alt: "Flame graph of the pose detection pipeline",
        caption:
          "The flame graph that settled the argument: the cost is native inference, not application code, which measured 0.01% of samples."
      }
    ],
    retrospective: {
      wentRight: [
        "Version 1.1 runs on a physical device with on-device pose detection, and the performance claims behind it are measured rather than asserted.",
        "Profiling caught a detector and executor leak that code review had not, and the fix is confirmed by a stable memory ceiling across three runs.",
        "Building the developer screen early paid for itself repeatedly during testing, and it stays out of the participant build.",
        "Elena's usability findings and my device measurements pointed at the same defects independently, which raised confidence in both."
      ],
      wentWrong: [
        "I spent most of the month assuming the angle math was the bottleneck. It was 0.01% of the workload. I should have profiled in week one rather than week four.",
        "Six attempts at automated frame-timing measurement failed before I switched instruments, which cost a day and produced nothing usable.",
        "I lost a completed benchmark run by re-running the harness, which clears its own output directory. The artifacts are now copied out automatically, but that was avoidable.",
        "Our IRB submission has been waiting on a response since July, which is now the real constraint on recruitment rather than anything in the code."
      ],
      improvements: [
        "Profile before optimizing, every time. The measurement is cheap and the assumption was expensive.",
        "Fix the study protocol before recruiting: camera placement, distance, and lighting have to be constant or the pose data will vary for reasons unrelated to the participant.",
        "Report medians and spread rather than single runs. One outlier moved this project's cold-start mean to more than double its median.",
        "Follow up on the IRB submission directly rather than continuing to wait, and keep building the parts of the study that do not depend on approval."
      ]
    }
  },
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
