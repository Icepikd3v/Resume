import { readFile } from "node:fs/promises";

const MAX_README_CHARS = 120_000;
const LOCAL_PATH_PATTERN = /\/Users\/[^/\s]+\/([^\s"'`]+)/g;

function sanitizeLocalPaths(text: string) {
  return text.replace(LOCAL_PATH_PATTERN, "/path/to/$1");
}

export async function loadProjectReadme(path?: string) {
  if (!path) return null;

  try {
    const raw = await readFile(path, "utf8");
    if (!raw.trim()) return null;
    const clipped = raw.slice(0, MAX_README_CHARS);
    return sanitizeLocalPaths(clipped);
  } catch {
    return null;
  }
}
