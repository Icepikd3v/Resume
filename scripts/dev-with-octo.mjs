import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";

const root = process.cwd();
const octoRoot = path.resolve(root, "../icepik-octo-manager/App");
const localEnvPath = path.join(root, ".env.local");

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
    env[key] = unquoted;
  }

  return env;
}

const sharedEnv = {
  ...parseEnvFile(localEnvPath)
};

const services = [
  {
    name: "resume-site",
    cwd: root,
    cmd: "npm",
    args: ["run", "dev:resume"],
    env: {}
  },
  {
    name: "octo-backend",
    cwd: path.join(octoRoot, "iom-backend"),
    cmd: "node",
    args: ["server.js"],
    env: { PORT: "5000" }
  },
  {
    name: "octo-frontend",
    cwd: path.join(octoRoot, "iom-frontend"),
    cmd: "npm",
    args: ["start"],
    env: {
      PORT: "3105",
      BROWSER: "none"
    }
  }
];

const children = [];

function ensureDependencies(service) {
  const hasPackageJson = existsSync(path.join(service.cwd, "package.json"));
  if (!hasPackageJson) return;

  const hasNodeModules = existsSync(path.join(service.cwd, "node_modules"));
  if (hasNodeModules) return;

  console.log(`[${service.name}] installing dependencies...`);
  const result = spawnSync("npm", ["install"], {
    cwd: service.cwd,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    console.error(`[${service.name}] npm install failed`);
  }
}

function startService(service) {
  if (!existsSync(service.cwd)) {
    console.warn(`[skip] ${service.name}: missing path ${service.cwd}`);
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

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(0), 400);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Running resume-site + icepik-octo-manager services...");
