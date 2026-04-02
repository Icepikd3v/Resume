import type { Project } from "@/lib/resume-data";

type RuntimeOverride = {
  appUrl?: string;
  backendUrl?: string;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
const internalLabPathMap: Record<string, string> = {
  "icepik-octo-manager": "/projects/icepik-octo-manager/live",
  "ufc-api": "/projects/ufc-api/live",
  "rick-and-morty-react": "/projects/rick-and-morty-react/live",
  "ready-set-travel": "/projects/ready-set-travel/live"
};
const productionRuntimeFallbacks: Record<string, string> = {
  "rick-and-morty-react": "https://rick-and-morty-react.netlify.app",
  "ready-set-travel":
    "https://cdn.jsdelivr.net/gh/Icepikd3v/ReadySetTravel@main/dev/readysettravel/index.html"
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
  const nextAppUrl = override?.appUrl || fallback.appUrl;
  const nextBackendUrl = override?.backendUrl || fallback.backendUrl;
  const isProduction = process.env.NODE_ENV === "production";
  const useInternalLabs = shouldUseInternalLabs();
  const internalLabUrl = internalLabPathMap[project.slug];
  const resolvedAppUrl =
    useInternalLabs && internalLabUrl
      ? internalLabUrl
      : isProduction && isLocalRuntimeUrl(nextAppUrl)
      ? productionRuntimeFallbacks[project.slug] || project.liveUrl || project.sourceUrl || nextAppUrl
      : nextAppUrl;

  return {
    ...fallback,
    appUrl: resolvedAppUrl,
    backendUrl: nextBackendUrl
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

export function isLocalRuntimeUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return LOCAL_HOSTS.has(parsed.hostname);
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
  }
}

function shouldUseInternalLabs() {
  if (process.env.SHOWCASE_USE_INTERNAL_LABS === "true") return true;
  if (process.env.SHOWCASE_USE_INTERNAL_LABS === "false") return false;
  return process.env.NODE_ENV === "production";
}
