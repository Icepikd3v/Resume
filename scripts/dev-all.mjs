import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";

const root = process.cwd();
const localEnvPath = path.join(root, ".env.local");
const preferredNodeBin = "/Users/icepik/.nvm/versions/node/v20.19.6/bin";
const hasPreferredNode = existsSync(path.join(preferredNodeBin, "node"));

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const rows = readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};

  for (const row of rows) {
    const line = row.trim();
    if (!line || line.startsWith("#")) continue;
    const sep = line.indexOf("=");
    if (sep < 0) continue;
    const key = line.slice(0, sep).trim();
    const rawValue = line.slice(sep + 1).trim();
    const unquoted = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!unquoted) continue;
    env[key] = unquoted;
  }

  return env;
}

function buildPath() {
  if (!hasPreferredNode) return process.env.PATH || "";
  const current = process.env.PATH || "";
  if (current.includes(preferredNodeBin)) return current;
  return `${preferredNodeBin}:${current}`;
}

function isPortInUse(port) {
  const result = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], {
    stdio: "pipe"
  });
  return result.status === 0;
}

const localEnv = parseEnvFile(localEnvPath);

const sharedEnv = {
  ...localEnv,
  PATH: buildPath(),
  SESSION_SECRET: process.env.SESSION_SECRET || "resume-site-dev-session-secret",
  JWT_SECRET: process.env.JWT_SECRET || "resume-site-dev-jwt-secret"
};

const services = [
  {
    name: "resume-site",
    cwd: root,
    cmd: "npm",
    args: ["run", "dev:resume"],
    env: { PORT: "3000" },
    port: 3000
  },
  {
    name: "rick-morty-client",
    cwd: "/Users/icepik/dev/rick-and-morty-react/Client/rick-and-morty-api",
    cmd: "npm",
    args: ["start"],
    env: {
      PORT: "3103",
      BROWSER: "none",
      REACT_APP_RM_API_URL: "http://localhost:5051/api"
    },
    port: 3103
  },
  {
    name: "rick-morty-server",
    cwd: "/Users/icepik/dev/rick-and-morty-react/server",
    cmd: "npm",
    args: ["start"],
    env: { PORT: "5051" },
    port: 5051
  },
  {
    name: "ready-set-travel",
    cwd: "/Users/icepik/dev/ReadySetTravel/dev/readysettravel",
    cmd: "python3",
    args: ["-m", "http.server", "3104"],
    env: {},
    port: 3104
  },
  {
    name: "octo-backend",
    cwd: "/Users/icepik/dev/icepik-octo-manager/App/iom-backend",
    cmd: "node",
    args: ["server.js"],
    env: { PORT: "5052" },
    port: 5052,
    requiredEnv: ["MONGO_URI"]
  },
  {
    name: "octo-frontend",
    cwd: "/Users/icepik/dev/icepik-octo-manager/App/iom-frontend",
    cmd: "npm",
    args: ["start"],
    env: { PORT: "3105", BROWSER: "none", REACT_APP_API_BASE_URL: "http://localhost:5052/api" },
    port: 3105
  },
  {
    name: "ufc-backend",
    cwd: "/Users/icepik/dev/ufc-mobile/server",
    cmd: "npm",
    args: ["start"],
    env: { PORT: "5053" },
    port: 5053
  },
  {
    name: "ufc-web",
    cwd: "/Users/icepik/dev/ufc-mobile",
    cmd: "npm",
    args: ["run", "web"],
    env: { CI: "1", EXPO_PUBLIC_UFC_API_URL: "http://localhost:5053/api/v1" },
    port: 8081
  }
];

const children = [];

function ensureDependencies(service) {
  if (service.cmd !== "npm") return;
  if (!existsSync(path.join(service.cwd, "package.json"))) return;
  if (existsSync(path.join(service.cwd, "node_modules"))) return;

  console.log(`[${service.name}] installing dependencies...`);
  const result = spawnSync("npm", ["install"], {
    cwd: service.cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, PATH: sharedEnv.PATH }
  });

  if (result.status !== 0) {
    console.error(`[${service.name}] npm install failed`);
  }
}

function hasRequiredEnv(service) {
  if (!service.requiredEnv?.length) return true;
  const missing = service.requiredEnv.filter((key) => !String(sharedEnv[key] || "").trim());
  if (missing.length) {
    console.warn(`[skip] ${service.name}: missing required env (${missing.join(", ")})`);
    return false;
  }
  return true;
}

function startService(service) {
  if (!existsSync(service.cwd)) {
    console.warn(`[skip] ${service.name}: missing path ${service.cwd}`);
    return;
  }

  if (!hasRequiredEnv(service)) {
    return;
  }

  if (service.port && isPortInUse(service.port)) {
    console.log(`[skip] ${service.name}: port ${service.port} already in use (reusing existing service)`);
    return;
  }

  ensureDependencies(service);

  const child = spawn(service.cmd, service.args, {
    cwd: service.cwd,
    env: { ...process.env, ...sharedEnv, ...service.env },
    stdio: "pipe",
    shell: process.platform === "win32"
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${service.name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${service.name}] ${chunk}`));
  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`[${service.name}] exited with code ${code}`);
    }
  });

  children.push(child);
}

for (const service of services) startService(service);

if (children.length === 0) {
  console.log("No new services were started. Existing services may already be running.");
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(0), 500);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Running resume-site + all local project apps...");
