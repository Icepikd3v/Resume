type LabSnippet = {
  title: string;
  path: string;
  language: string;
  code: string;
};

export type ProjectLiveLab = {
  importedAt: string;
  objective: string;
  architecture: string[];
  documentation: string[];
  implementation: LabSnippet[];
};

const labsBySlug: Record<string, ProjectLiveLab> = {
  "icepik-octo-manager": {
    importedAt: "2026-04-02",
    objective: "Operate a multi-user print workflow with protected frontend routes and a Node/Express API.",
    architecture: [
      "React frontend (route-protected dashboard, upload, file library, live queue views).",
      "Express backend with MongoDB models for users, models, print jobs, and analytics.",
      "OctoPrint-oriented workflows exposed through API endpoints and admin analytics."
    ],
    documentation: [
      "Repo README confirms this is the migrated Full Sail capstone with auth, queueing, and analytics.",
      "Backend route map includes auth, models, print jobs, printers, users, and analytics endpoints.",
      "Runtime profile in resume-site preserves local start commands for full-stack dev."
    ],
    implementation: [
      {
        title: "Frontend Route Surface",
        path: "App/iom-frontend/src/routes/routes.js",
        language: "js",
        code: `import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import FileLibrary from "../pages/FileLibrary";
import Live from "../pages/Live";
import ProtectedRoute from "./ProtectedRoutes";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
    <Route path="/file-library" element={<ProtectedRoute><FileLibrary /></ProtectedRoute>} />
    <Route path="/live" element={<ProtectedRoute><Live /></ProtectedRoute>} />
  </Routes>
);`
      },
      {
        title: "Backend API Bootstrap",
        path: "App/iom-backend/server.js",
        language: "js",
        code: `const express = require("express");
const connectDB = require("./config/db");
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/print-jobs", printJobRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "API is running" });
});`
      }
    ]
  },
  "ufc-api": {
    importedAt: "2026-04-02",
    objective: "Provide mobile-first fighter CRUD + auth workflows powered by an Express/Mongo API.",
    architecture: [
      "React Native app with stack navigation and token-aware startup flow.",
      "Express API with signup/login, JWT auth middleware, and fighter CRUD endpoints.",
      "Roster sync pipeline for importing UFC fighter rows from API or dataset."
    ],
    documentation: [
      "UFC Mobile README documents fighter list/detail/add/update/delete flows.",
      "Server includes /api/v1 health and auth routes with JWT + bcrypt.",
      "Resume integration keeps UFC as a single deployed lab in this site while preserving source links."
    ],
    implementation: [
      {
        title: "React Native Navigation + Auth Gate",
        path: "ufc-mobile/App.js",
        language: "js",
        code: `const [initialRoute, setInitialRoute] = useState("Login");

useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem("authToken");
    setInitialRoute(token ? "Home" : "Login");
  };
  checkToken();
}, []);

<Stack.Navigator initialRouteName={initialRoute}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="FightersList" component={FightersListScreen} />
  <Stack.Screen name="AddFighter" component={AddFighterScreen} />
  <Stack.Screen name="UpdateFighter" component={UpdateFighterScreen} />
</Stack.Navigator>;`
      },
      {
        title: "API Health + Roster Sync Foundation",
        path: "ufc-mobile/server/index.js",
        language: "js",
        code: `const PORT = process.env.PORT || 5053;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ufc_mobile";

app.get("/api/v1/health", (_, res) => {
  res.json({ ok: true, service: "ufc-mobile-api" });
});

async function resolveRosterRows(rosterUrl, body) {
  if (Array.isArray(body?.fighters) && body.fighters.length > 0) return body.fighters;
  const response = await fetch(rosterUrl);
  const payload = await response.json();
  return normalizeRosterPayload(payload);
}`
      }
    ]
  },
  "rick-and-morty-react": {
    importedAt: "2026-04-02",
    objective: "Deliver fan-facing character search plus authenticated user submissions with media upload.",
    architecture: [
      "React SPA with route views (home, search, about, submit) behind login gate.",
      "Express backend handling auth, submissions, and proxy search to Rick and Morty API.",
      "Mongo persistence for users and submitted characters."
    ],
    documentation: [
      "Portfolio project README tracks milestone progression and tech stack.",
      "Frontend runtime supports `REACT_APP_RM_API_URL` to target API host.",
      "Backend exposes submission CRUD and upstream API search proxy."
    ],
    implementation: [
      {
        title: "Client Auth + Routed Experience",
        path: "Client/rick-and-morty-api/src/App.js",
        language: "js",
        code: `const API_BASE_URL = process.env.REACT_APP_RM_API_URL || "http://localhost:5051/api";
if (!isAuthenticated) {
  return <LoginPage onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />;
}

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/search" element={<SearchPage apiBaseUrl={API_BASE_URL} />} />
  <Route path="/submit" element={<SubmitPage apiBaseUrl={API_BASE_URL} token={token} />} />
</Routes>;`
      },
      {
        title: "Server Auth + Submission + Search Proxy",
        path: "server/index.js",
        language: "js",
        code: `app.post("/api/auth/login", async (req, res) => { /* validate + JWT */ });
app.get("/api/characters/submissions", auth, async (req, res) => {
  const characters = await Character.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
  res.json(characters);
});

app.get("/api/characters/search", async (req, res) => {
  const response = await fetch(
    \`https://rickandmortyapi.com/api/character/?name=\${encodeURIComponent(req.query.name)}\`
  );
  const data = await response.json();
  res.json(data);
});`
      }
    ]
  },
  "ready-set-travel": {
    importedAt: "2026-04-02",
    objective: "Static multi-page travel site with responsive layout, content blocks, and lightweight JS data rendering.",
    architecture: [
      "HTML pages with Tailwind utility classes + custom CSS for layout polish.",
      "Simple JavaScript object data to populate tour card copy and pricing.",
      "Design emphasis on hero, destination grid, and CTA-oriented booking flow."
    ],
    documentation: [
      "Repository captures weekly stand-up milestones and frontend progression.",
      "Page uses `CSS/style.css` and `JS/script.js` with static asset folders.",
      "This unified lab keeps the project accessible from one resume-site deployment."
    ],
    implementation: [
      {
        title: "Home Page Structure",
        path: "dev/readysettravel/index.html",
        language: "html",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="CSS/style.css">
  </head>
  <body>
    <header>...</header>
    <article class="bigpicture">...</article>
    <article class="Trending">...</article>
    <footer>...</footer>
    <script src="JS/script.js"></script>
  </body>
</html>`
      },
      {
        title: "Tour Card Data Binding",
        path: "dev/readysettravel/JS/script.js",
        language: "js",
        code: `let Place1 = { Name: "Alps Mountain Hiking Tour", Time: "4 days | 10 stops", Price: "$1,500" };
let Place2 = { Name: "Snorkel the Barrier Reef Tour", Time: "2 days | 2 stops", Price: "$1,000" };
let Place3 = { Name: "Tour the Pyramids on Camelback", Time: "2 days | 2 stops", Price: "$2,000" };

document.getElementById("Name1").innerHTML = Place1.Name;
document.getElementById("Time1").innerHTML = Place1.Time;
document.getElementById("Price1").innerHTML = Place1.Price;`
      }
    ]
  }
};

export function getProjectLiveLab(slug: string) {
  return labsBySlug[slug];
}
