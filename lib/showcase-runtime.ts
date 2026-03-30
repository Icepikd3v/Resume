import type { Project } from "@/lib/resume-data";

type RuntimeOverride = {
  appUrl?: string;
  backendUrl?: string;
};

const runtimeEnvMap: Record<string, RuntimeOverride> = {
  "rick-and-morty-react": {
    appUrl: process.env.SHOWCASE_RICK_MORTY_URL,
    backendUrl: process.env.SHOWCASE_RICK_MORTY_API_URL
  },
  "ready-set-travel": {
    appUrl: process.env.SHOWCASE_READY_SET_TRAVEL_URL
  },
  "icepik-octo-manager": {
    appUrl: process.env.SHOWCASE_OCTO_MANAGER_URL,
    backendUrl: process.env.SHOWCASE_OCTO_MANAGER_API_URL
  },
  "ufc-api": {
    appUrl: process.env.SHOWCASE_UFC_MOBILE_URL,
    backendUrl: process.env.SHOWCASE_UFC_API_URL
  },
  "icepikd3v-profile": {
    appUrl: process.env.SHOWCASE_ICEPIKD3V_PROFILE_URL
  }
};

const proxyPathMap: Record<string, string> = {
  "rick-and-morty-react": "/showcase/rick-and-morty-react",
  "ready-set-travel": "/showcase/ready-set-travel",
  "icepik-octo-manager": "/showcase/icepik-octo-manager"
  // ufc mobile remains external because Expo web/devices do not embed reliably in iframe proxy mode.
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

export function resolveProjectEmbedUrl(project: Project, appUrl: string) {
  const useProxy = process.env.SHOWCASE_PROXY_ENABLED === "true";
  const proxyPath = proxyPathMap[project.slug];
  const hasConfiguredTarget = Boolean(runtimeEnvMap[project.slug]?.appUrl);

  if (useProxy && proxyPath && hasConfiguredTarget) {
    return proxyPath;
  }

  return appUrl;
}
