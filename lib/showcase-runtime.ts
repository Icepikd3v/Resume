import type { Project } from "@/lib/resume-data";

type RuntimeOverride = {
  appUrl?: string;
  backendUrl?: string;
};

const runtimeEnvMap: Record<string, RuntimeOverride> = {
  "pp3-spotify": {
    appUrl: process.env.SHOWCASE_PP3_SPOTIFY_URL,
    backendUrl: process.env.SHOWCASE_PP3_SPOTIFY_API_URL
  },
  "rick-and-morty-react": {
    appUrl: process.env.SHOWCASE_RICK_MORTY_URL
  },
  "ready-set-travel": {
    appUrl: process.env.SHOWCASE_READY_SET_TRAVEL_URL
  },
  "icepik-octo-manager": {
    appUrl: process.env.SHOWCASE_OCTO_MANAGER_URL,
    backendUrl: process.env.SHOWCASE_OCTO_MANAGER_API_URL
  },
  "icepikd3v-profile": {
    appUrl: process.env.SHOWCASE_ICEPIKD3V_PROFILE_URL
  }
};

export function resolveProjectRuntime(project: Project) {
  const fallback = project.runtime;
  if (!fallback) return undefined;

  const override = runtimeEnvMap[project.slug];
  if (!override) return fallback;

  return {
    ...fallback,
    appUrl: override.appUrl || fallback.appUrl,
    backendUrl: override.backendUrl || fallback.backendUrl
  };
}

