import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { checkRateLimit, getClientIp } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
const AGENT_NAME = process.env.AI_CONCIERGE_NAME || process.env.NEXT_PUBLIC_AI_CONCIERGE_NAME || "Orbit";
const AGENT_STYLE = process.env.AI_CONCIERGE_STYLE || process.env.NEXT_PUBLIC_AI_CONCIERGE_STYLE || "Calm tactical co-pilot";
const DEFAULT_REGION_LABEL = process.env.AI_DEFAULT_REGION_LABEL || "West Virginia (East Coast, USA)";
const DEFAULT_TIMEZONE = process.env.AI_DEFAULT_TIMEZONE || "America/New_York";
const DEFAULT_CITY = process.env.AI_DEFAULT_CITY || "Charleston";
const DEFAULT_STATE = process.env.AI_DEFAULT_STATE || "WV";
const DEFAULT_COUNTRY = process.env.AI_DEFAULT_COUNTRY || "USA";

type ChatRequest = {
  message?: string;
  history?: Array<{ role?: "assistant" | "user"; text?: string }>;
};

type OrbitMood = "excited" | "angry" | "happy" | "curious";

type GeoResult = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  timezone?: string;
};

type OpenMeteoGeoResponse = {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
    timezone?: string;
  }>;
};

type OpenMeteoWeatherResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

type TriviaResponse = {
  results?: Array<{
    question?: string;
    correct_answer?: string;
    category?: string;
  }>;
};

type ResolvedIntent = {
  intent: "weather" | "time" | "trivia" | "contact" | "general";
  fromHistory: boolean;
};

const LOCATION_ALIASES: Record<string, string> = {
  "rio de jenario": "Rio de Janeiro, Brazil",
  "rio de jenario brazil": "Rio de Janeiro, Brazil",
  "rio de janeiro": "Rio de Janeiro, Brazil",
  "rio brazil": "Rio de Janeiro, Brazil",
  "sao paolo": "Sao Paulo, Brazil",
  "sao paulo": "Sao Paulo, Brazil",
  "newyork": "New York, United States",
  "new york city": "New York, United States",
  "la": "Los Angeles, United States",
  "nyc": "New York, United States",
  "u k": "United Kingdom",
  uk: "United Kingdom",
  england: "London, United Kingdom",
  scotland: "Edinburgh, United Kingdom",
  wales: "Cardiff, United Kingdom",
  brasil: "Brazil",
  "u s": "United States",
  us: "United States",
  usa: "United States",
  america: "United States",
  "uae": "United Arab Emirates",
  "u a e": "United Arab Emirates",
  "south korea": "South Korea",
  "korea south": "South Korea",
  "north korea": "North Korea"
};

const LOCATION_TOKEN_FIXES: Array<{ from: RegExp; to: string }> = [
  { from: /\bjenario\b/gi, to: "janeiro" },
  { from: /\bsa0\b/gi, to: "sao" },
  { from: /\bnewyork\b/gi, to: "new york" },
  { from: /\bdelhii\b/gi, to: "delhi" }
];

const COUNTRY_DEFAULT_TIMEZONES: Record<string, { tz: string; label: string; multi?: boolean }> = {
  brazil: { tz: "America/Sao_Paulo", label: "Brazil", multi: true },
  "united states": { tz: "America/New_York", label: "United States", multi: true },
  usa: { tz: "America/New_York", label: "United States", multi: true },
  canada: { tz: "America/Toronto", label: "Canada", multi: true },
  mexico: { tz: "America/Mexico_City", label: "Mexico", multi: true },
  argentina: { tz: "America/Argentina/Buenos_Aires", label: "Argentina" },
  chile: { tz: "America/Santiago", label: "Chile", multi: true },
  colombia: { tz: "America/Bogota", label: "Colombia" },
  peru: { tz: "America/Lima", label: "Peru" },
  venezuela: { tz: "America/Caracas", label: "Venezuela" },
  bolivia: { tz: "America/La_Paz", label: "Bolivia" },
  paraguay: { tz: "America/Asuncion", label: "Paraguay" },
  uruguay: { tz: "America/Montevideo", label: "Uruguay" },
  ecuador: { tz: "America/Guayaquil", label: "Ecuador", multi: true },
  germany: { tz: "Europe/Berlin", label: "Germany" },
  france: { tz: "Europe/Paris", label: "France" },
  spain: { tz: "Europe/Madrid", label: "Spain", multi: true },
  italy: { tz: "Europe/Rome", label: "Italy" },
  portugal: { tz: "Europe/Lisbon", label: "Portugal", multi: true },
  "united kingdom": { tz: "Europe/London", label: "United Kingdom" },
  ireland: { tz: "Europe/Dublin", label: "Ireland" },
  netherlands: { tz: "Europe/Amsterdam", label: "Netherlands" },
  sweden: { tz: "Europe/Stockholm", label: "Sweden" },
  norway: { tz: "Europe/Oslo", label: "Norway" },
  finland: { tz: "Europe/Helsinki", label: "Finland" },
  poland: { tz: "Europe/Warsaw", label: "Poland" },
  ukraine: { tz: "Europe/Kyiv", label: "Ukraine" },
  turkey: { tz: "Europe/Istanbul", label: "Turkey" },
  india: { tz: "Asia/Kolkata", label: "India" },
  china: { tz: "Asia/Shanghai", label: "China", multi: true },
  japan: { tz: "Asia/Tokyo", label: "Japan" },
  "south korea": { tz: "Asia/Seoul", label: "South Korea" },
  thailand: { tz: "Asia/Bangkok", label: "Thailand" },
  vietnam: { tz: "Asia/Ho_Chi_Minh", label: "Vietnam" },
  singapore: { tz: "Asia/Singapore", label: "Singapore" },
  indonesia: { tz: "Asia/Jakarta", label: "Indonesia", multi: true },
  philippines: { tz: "Asia/Manila", label: "Philippines" },
  malaysia: { tz: "Asia/Kuala_Lumpur", label: "Malaysia" },
  australia: { tz: "Australia/Sydney", label: "Australia", multi: true },
  "new zealand": { tz: "Pacific/Auckland", label: "New Zealand" },
  "south africa": { tz: "Africa/Johannesburg", label: "South Africa" },
  egypt: { tz: "Africa/Cairo", label: "Egypt" },
  nigeria: { tz: "Africa/Lagos", label: "Nigeria" },
  kenya: { tz: "Africa/Nairobi", label: "Kenya" },
  "saudi arabia": { tz: "Asia/Riyadh", label: "Saudi Arabia" },
  "united arab emirates": { tz: "Asia/Dubai", label: "United Arab Emirates" },
  israel: { tz: "Asia/Jerusalem", label: "Israel" }
};

const COUNTRY_DEFAULT_LOCATIONS: Record<
  string,
  { label: string; city: string; country: string; latitude: number; longitude: number; timezone: string; multi?: boolean }
> = {
  brazil: { label: "Brazil", city: "Brasilia", country: "Brazil", latitude: -15.793889, longitude: -47.882778, timezone: "America/Sao_Paulo", multi: true },
  "united states": { label: "United States", city: "Washington", country: "United States", latitude: 38.89511, longitude: -77.03637, timezone: "America/New_York", multi: true },
  usa: { label: "United States", city: "Washington", country: "United States", latitude: 38.89511, longitude: -77.03637, timezone: "America/New_York", multi: true },
  canada: { label: "Canada", city: "Ottawa", country: "Canada", latitude: 45.42153, longitude: -75.69719, timezone: "America/Toronto", multi: true },
  mexico: { label: "Mexico", city: "Mexico City", country: "Mexico", latitude: 19.432608, longitude: -99.133209, timezone: "America/Mexico_City", multi: true },
  argentina: { label: "Argentina", city: "Buenos Aires", country: "Argentina", latitude: -34.603722, longitude: -58.381592, timezone: "America/Argentina/Buenos_Aires" },
  chile: { label: "Chile", city: "Santiago", country: "Chile", latitude: -33.44889, longitude: -70.669266, timezone: "America/Santiago", multi: true },
  colombia: { label: "Colombia", city: "Bogota", country: "Colombia", latitude: 4.711, longitude: -74.0721, timezone: "America/Bogota" },
  peru: { label: "Peru", city: "Lima", country: "Peru", latitude: -12.046374, longitude: -77.042793, timezone: "America/Lima" },
  uruguay: { label: "Uruguay", city: "Montevideo", country: "Uruguay", latitude: -34.901112, longitude: -56.164532, timezone: "America/Montevideo" },
  paraguay: { label: "Paraguay", city: "Asuncion", country: "Paraguay", latitude: -25.263739, longitude: -57.575926, timezone: "America/Asuncion" },
  venezuela: { label: "Venezuela", city: "Caracas", country: "Venezuela", latitude: 10.480594, longitude: -66.903606, timezone: "America/Caracas" },
  bolivia: { label: "Bolivia", city: "La Paz", country: "Bolivia", latitude: -16.489689, longitude: -68.119294, timezone: "America/La_Paz" },
  ecuador: { label: "Ecuador", city: "Quito", country: "Ecuador", latitude: -0.180653, longitude: -78.467834, timezone: "America/Guayaquil", multi: true },
  germany: { label: "Germany", city: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin" },
  france: { label: "France", city: "Paris", country: "France", latitude: 48.856613, longitude: 2.352222, timezone: "Europe/Paris" },
  spain: { label: "Spain", city: "Madrid", country: "Spain", latitude: 40.416775, longitude: -3.70379, timezone: "Europe/Madrid", multi: true },
  italy: { label: "Italy", city: "Rome", country: "Italy", latitude: 41.902782, longitude: 12.496366, timezone: "Europe/Rome" },
  portugal: { label: "Portugal", city: "Lisbon", country: "Portugal", latitude: 38.722252, longitude: -9.139337, timezone: "Europe/Lisbon", multi: true },
  "united kingdom": { label: "United Kingdom", city: "London", country: "United Kingdom", latitude: 51.507351, longitude: -0.127758, timezone: "Europe/London" },
  ireland: { label: "Ireland", city: "Dublin", country: "Ireland", latitude: 53.349805, longitude: -6.26031, timezone: "Europe/Dublin" },
  netherlands: { label: "Netherlands", city: "Amsterdam", country: "Netherlands", latitude: 52.367573, longitude: 4.904139, timezone: "Europe/Amsterdam" },
  sweden: { label: "Sweden", city: "Stockholm", country: "Sweden", latitude: 59.329323, longitude: 18.068581, timezone: "Europe/Stockholm" },
  norway: { label: "Norway", city: "Oslo", country: "Norway", latitude: 59.913868, longitude: 10.752245, timezone: "Europe/Oslo" },
  finland: { label: "Finland", city: "Helsinki", country: "Finland", latitude: 60.169856, longitude: 24.938379, timezone: "Europe/Helsinki" },
  poland: { label: "Poland", city: "Warsaw", country: "Poland", latitude: 52.229676, longitude: 21.012229, timezone: "Europe/Warsaw" },
  ukraine: { label: "Ukraine", city: "Kyiv", country: "Ukraine", latitude: 50.450001, longitude: 30.523333, timezone: "Europe/Kyiv" },
  turkey: { label: "Turkey", city: "Istanbul", country: "Turkey", latitude: 41.008238, longitude: 28.978359, timezone: "Europe/Istanbul" },
  india: { label: "India", city: "New Delhi", country: "India", latitude: 28.613939, longitude: 77.209023, timezone: "Asia/Kolkata" },
  china: { label: "China", city: "Beijing", country: "China", latitude: 39.904202, longitude: 116.407394, timezone: "Asia/Shanghai", multi: true },
  japan: { label: "Japan", city: "Tokyo", country: "Japan", latitude: 35.689487, longitude: 139.691711, timezone: "Asia/Tokyo" },
  "south korea": { label: "South Korea", city: "Seoul", country: "South Korea", latitude: 37.566536, longitude: 126.977966, timezone: "Asia/Seoul" },
  thailand: { label: "Thailand", city: "Bangkok", country: "Thailand", latitude: 13.756331, longitude: 100.501762, timezone: "Asia/Bangkok" },
  vietnam: { label: "Vietnam", city: "Ho Chi Minh City", country: "Vietnam", latitude: 10.823099, longitude: 106.629662, timezone: "Asia/Ho_Chi_Minh" },
  singapore: { label: "Singapore", city: "Singapore", country: "Singapore", latitude: 1.352083, longitude: 103.819839, timezone: "Asia/Singapore" },
  indonesia: { label: "Indonesia", city: "Jakarta", country: "Indonesia", latitude: -6.208763, longitude: 106.845599, timezone: "Asia/Jakarta", multi: true },
  philippines: { label: "Philippines", city: "Manila", country: "Philippines", latitude: 14.599512, longitude: 120.984222, timezone: "Asia/Manila" },
  malaysia: { label: "Malaysia", city: "Kuala Lumpur", country: "Malaysia", latitude: 3.139003, longitude: 101.686852, timezone: "Asia/Kuala_Lumpur" },
  australia: { label: "Australia", city: "Sydney", country: "Australia", latitude: -33.86882, longitude: 151.20929, timezone: "Australia/Sydney", multi: true },
  "new zealand": { label: "New Zealand", city: "Auckland", country: "New Zealand", latitude: -36.848461, longitude: 174.763336, timezone: "Pacific/Auckland" },
  "south africa": { label: "South Africa", city: "Johannesburg", country: "South Africa", latitude: -26.204103, longitude: 28.047304, timezone: "Africa/Johannesburg" },
  egypt: { label: "Egypt", city: "Cairo", country: "Egypt", latitude: 30.04442, longitude: 31.235712, timezone: "Africa/Cairo" },
  nigeria: { label: "Nigeria", city: "Lagos", country: "Nigeria", latitude: 6.524379, longitude: 3.379206, timezone: "Africa/Lagos" },
  kenya: { label: "Kenya", city: "Nairobi", country: "Kenya", latitude: -1.286389, longitude: 36.817223, timezone: "Africa/Nairobi" },
  "saudi arabia": { label: "Saudi Arabia", city: "Riyadh", country: "Saudi Arabia", latitude: 24.713551, longitude: 46.675297, timezone: "Asia/Riyadh" },
  "united arab emirates": { label: "United Arab Emirates", city: "Dubai", country: "United Arab Emirates", latitude: 25.204849, longitude: 55.270782, timezone: "Asia/Dubai" },
  israel: { label: "Israel", city: "Jerusalem", country: "Israel", latitude: 31.768319, longitude: 35.21371, timezone: "Asia/Jerusalem" }
};

const US_STATE_ABBR: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia"
};

function normalizeLookupKey(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyTokenFixes(input: string) {
  let output = input;
  for (const fix of LOCATION_TOKEN_FIXES) {
    output = output.replace(fix.from, fix.to);
  }
  return output;
}

function applyLocationAlias(input: string) {
  const key = normalizeLookupKey(applyTokenFixes(input));
  return LOCATION_ALIASES[key] || input;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail"
};

function decodeHtmlEntities(input: string) {
  return input
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&eacute;", "e");
}

function extractLocation(message: string, kind: "weather" | "time") {
  const lower = message.toLowerCase();
  const trigger = kind === "weather" ? /(weather|forecast|temperature)/i : /(time|clock)/i;
  if (!trigger.test(lower)) return "";

  const explicit = message.match(/\b(?:in|for|at)\s+([a-zA-Z\s,.'-]{2,64})/i)?.[1] || "";
  const contextual = message.match(
    kind === "weather"
      ? /(?:weather|forecast|temperature)[a-zA-Z\s,.'-]*?([a-zA-Z][a-zA-Z\s,.'-]{1,60})/i
      : /(?:time|clock)[a-zA-Z\s,.'-]*?([a-zA-Z][a-zA-Z\s,.'-]{1,60})/i
  )?.[1] || "";

  const raw = explicit || contextual;
  if (!raw) return "";

  return sanitizeLocationCandidate(raw);
}

function sanitizeLocationCandidate(raw: string) {
  const cleaned = applyTokenFixes(
    raw
    .replace(/\b(today|tonight|now|right now|please|currently|current|like|about)\b/gi, "")
    .replace(/[?.!,;:]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
  );

  const directAbbr = cleaned.replace(/\./g, "").toUpperCase();
  if (US_STATE_ABBR[directAbbr]) return US_STATE_ABBR[directAbbr];

  const expandedState = cleaned.replace(/\b([A-Za-z]{2})\b/g, (token) => {
    const expanded = US_STATE_ABBR[token.toUpperCase()];
    return expanded || token;
  });

  return applyLocationAlias(expandedState);
}

function getCountryDefault(location: string) {
  const normalized = normalizeLookupKey(location);
  const aliasExpanded = normalizeLookupKey(applyLocationAlias(location));
  const key = COUNTRY_DEFAULT_LOCATIONS[normalized]
    ? normalized
    : COUNTRY_DEFAULT_LOCATIONS[aliasExpanded]
      ? aliasExpanded
      : "";
  if (!key) return null;
  return COUNTRY_DEFAULT_LOCATIONS[key];
}

async function geocodeFromNominatim(location: string): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`;
  const res = await fetchWithTimeout(
    url,
    {
      cache: "no-store",
      headers: {
        "User-Agent": "Orbit-Resume-Agent/1.0"
      }
    },
    12000
  );
  if (!res.ok) return null;

  const json = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
  const first = json?.[0];
  if (!first?.lat || !first?.lon) return null;

  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return {
    latitude: lat,
    longitude: lon,
    name: location,
    country: first.display_name
  };
}

async function resolveTimezoneFromCoords(latitude: number, longitude: number): Promise<string | null> {
  const tzUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`;
  const res = await fetchWithTimeout(tzUrl, { cache: "no-store" }, 12000);
  if (!res.ok) return null;
  const json = (await res.json()) as { timezone?: string };
  return json.timezone || null;
}

function extractLocationFromFollowup(message: string) {
  const about = message.match(/\b(?:what|how)\s+about\s+([a-zA-Z\s,.'-]{2,64})/i)?.[1] || "";
  if (about) return sanitizeLocationCandidate(about);

  const plain = message.match(/^(?:and\s+)?([a-zA-Z][a-zA-Z\s,.'-]{1,64})\??$/i)?.[1] || "";
  if (!plain) return "";
  return sanitizeLocationCandidate(plain);
}

function extractLocationWithContext(message: string, kind: "weather" | "time", allowImplicit = false) {
  const primary = extractLocation(message, kind);
  if (primary) return primary;
  if (!allowImplicit) return "";
  return extractLocationFromFollowup(message);
}

function classifyIntent(text: string): ResolvedIntent["intent"] {
  const message = text.toLowerCase();
  if (message.includes("weather") || message.includes("forecast") || message.includes("temperature")) return "weather";
  if (message.includes("time") || message.includes("clock")) return "time";
  if (message.includes("trivia") || message.includes("fun fact") || message.includes("quiz")) return "trivia";
  if (message.includes("contact agent") || message.includes("email samuel") || message.includes("send samuel")) return "contact";
  return "general";
}

function isFollowupPrompt(text: string) {
  const lower = text.toLowerCase().trim();
  return (
    lower.startsWith("what about ") ||
    lower.startsWith("how about ") ||
    lower.startsWith("and ") ||
    lower === "what about that?" ||
    lower === "how about that?"
  );
}

function resolveIntent(
  rawMessage: string,
  history: Array<{ role: "assistant" | "user"; text: string }>
): ResolvedIntent {
  const direct = classifyIntent(rawMessage);
  if (direct !== "general") return { intent: direct, fromHistory: false };
  if (!isFollowupPrompt(rawMessage)) return { intent: "general", fromHistory: false };

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const prior = classifyIntent(history[i]?.text || "");
    if (prior !== "general" && prior !== "contact") {
      return { intent: prior, fromHistory: true };
    }
  }

  return { intent: "general", fromHistory: false };
}

async function geocodeLocation(location: string): Promise<GeoResult | null> {
  const countryDefault = getCountryDefault(location);
  const candidates = [
    location,
    applyLocationAlias(location),
    countryDefault ? `${countryDefault.city}, ${countryDefault.country}` : ""
  ];
  const uniqueCandidates = [...new Set(candidates.map((item) => item.trim()).filter(Boolean))];

  for (const candidate of uniqueCandidates) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=5&language=en&format=json`;
    const geoRes = await fetchWithTimeout(geoUrl, { cache: "no-store" });
    if (!geoRes.ok) continue;

    const geoJson = (await geoRes.json()) as OpenMeteoGeoResponse;
    const firstWithTimezone = geoJson.results?.find((result) => !!result.timezone) || geoJson.results?.[0];
    if (!firstWithTimezone) continue;

    return {
      latitude: firstWithTimezone.latitude,
      longitude: firstWithTimezone.longitude,
      name: firstWithTimezone.name,
      country: firstWithTimezone.country,
      timezone: firstWithTimezone.timezone
    };
  }

  for (const candidate of uniqueCandidates) {
    const fromNominatim = await geocodeFromNominatim(candidate);
    if (!fromNominatim) continue;
    const timezone = await resolveTimezoneFromCoords(fromNominatim.latitude, fromNominatim.longitude);
    return {
      ...fromNominatim,
      timezone: timezone || countryDefault?.timezone
    };
  }

  if (countryDefault) {
    return {
      latitude: countryDefault.latitude,
      longitude: countryDefault.longitude,
      name: countryDefault.city,
      country: countryDefault.country,
      timezone: countryDefault.timezone
    };
  }

  return null;
}

function getTimezoneByCountryOrAlias(location: string): { timezone: string; label: string; multi?: boolean } | null {
  const normalized = normalizeLookupKey(applyTokenFixes(location));
  const aliasExpanded = normalizeLookupKey(applyLocationAlias(location));
  const key = COUNTRY_DEFAULT_TIMEZONES[normalized]
    ? normalized
    : COUNTRY_DEFAULT_TIMEZONES[aliasExpanded]
      ? aliasExpanded
      : "";

  if (!key) return null;
  const hit = COUNTRY_DEFAULT_TIMEZONES[key];
  return { timezone: hit.tz, label: hit.label, multi: hit.multi };
}

function getDefaultLocationQuery() {
  return `${DEFAULT_CITY}, ${DEFAULT_STATE}, ${DEFAULT_COUNTRY}`;
}

async function getWeatherReply(location: string) {
  const countryDefault = getCountryDefault(location);
  let geo = await geocodeLocation(location);
  if (!geo && countryDefault) {
    geo = {
      latitude: countryDefault.latitude,
      longitude: countryDefault.longitude,
      name: countryDefault.city,
      country: countryDefault.country,
      timezone: countryDefault.timezone
    };
  }
  if (!geo) {
    return "I couldn't find that location yet. Try a city/country like: weather in Rio de Janeiro, Brazil.";
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  const weatherRes = await fetchWithTimeout(weatherUrl, { cache: "no-store" });
  if (!weatherRes.ok) {
    return "Weather service is temporarily unavailable. Please try again in a moment.";
  }

  const weatherJson = (await weatherRes.json()) as OpenMeteoWeatherResponse;
  const current = weatherJson.current;
  if (!current) {
    return "I couldn't pull current weather for that location right now.";
  }

  const label = WEATHER_LABELS[current.weather_code ?? 0] ?? "Current conditions available";
  const temp = typeof current.temperature_2m === "number" ? `${Math.round(current.temperature_2m)}°F` : "N/A";
  const wind = typeof current.wind_speed_10m === "number" ? `${Math.round(current.wind_speed_10m)} mph` : "N/A";

  const title = countryDefault && normalizeLookupKey(location) === normalizeLookupKey(countryDefault.label)
    ? `${countryDefault.label} (using ${countryDefault.city})`
    : `${geo.name}${geo.country ? `, ${geo.country}` : ""}`;
  const note = countryDefault?.multi && title.includes(countryDefault.label)
    ? " Country has multiple regions; showing a primary location."
    : "";

  return `Weather in ${title}: ${label}. Temperature: ${temp}. Wind: ${wind}.${note}`;
}

async function getDefaultWeatherReply() {
  return getWeatherReply(getDefaultLocationQuery());
}

async function getTimeReply(location: string) {
  const countryDefault = getCountryDefault(location);
  const geo = await geocodeLocation(location);
  const fallbackTz = !geo?.timezone ? getTimezoneByCountryOrAlias(location) : null;
  const timezone = geo?.timezone || fallbackTz?.timezone;
  const label = geo?.name
    ? `${geo.name}${geo.country ? `, ${geo.country}` : ""}`
    : fallbackTz?.label || countryDefault?.label || location;
  if (!timezone) {
    return "I couldn't resolve that location's timezone yet. Try a city/country like: time in Rio de Janeiro, Brazil.";
  }

  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());

  const note = fallbackTz?.multi
    ? " (Country has multiple time zones; showing a primary one.)"
    : "";
  return `Current time in ${label} (${timezone}) is ${now}.${note}`;
}

function getDefaultTimeReply() {
  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());

  return `Current time in ${DEFAULT_REGION_LABEL} (${DEFAULT_TIMEZONE}) is ${now}.`;
}

async function getTriviaReply() {
  try {
    const triviaRes = await fetchWithTimeout("https://opentdb.com/api.php?amount=1&type=multiple", { cache: "no-store" });
    if (!triviaRes.ok) {
      return "Trivia service is down right now. Ask again in a moment.";
    }

    const triviaJson = (await triviaRes.json()) as TriviaResponse;
    const item = triviaJson.results?.[0];

    if (!item?.question || !item.correct_answer) {
      return "I couldn't pull a trivia question right now.";
    }

    return `Trivia (${item.category || "General"}): ${decodeHtmlEntities(item.question)}\nAnswer: ${decodeHtmlEntities(item.correct_answer)}`;
  } catch {
    return "Trivia service is down right now. Ask again in a moment.";
  }
}

function inferMood(reply: string, sourceText = ""): OrbitMood {
  const text = `${reply} ${sourceText}`.toLowerCase();
  if (
    text.includes("unavailable") ||
    text.includes("error") ||
    text.includes("cannot") ||
    text.includes("couldn't") ||
    text.includes("failed") ||
    text.includes("thunderstorm") ||
    text.includes("heavy rain")
  ) {
    return "angry";
  }
  if (text.includes("trivia") || text.includes("question") || text.includes("fact")) {
    return "curious";
  }
  if (
    text.includes("great") ||
    text.includes("awesome") ||
    text.includes("clear sky") ||
    text.includes("sunny") ||
    text.includes("success")
  ) {
    return "excited";
  }
  return "happy";
}

function getLocalReply(message: string, content: Awaited<ReturnType<typeof getSiteContent>>): string | null {
  const text = message.toLowerCase();

  if (text.includes("who are you") || text.includes("who is sam") || text.includes("about samuel")) {
    return `I'm ${AGENT_NAME}, ${AGENT_STYLE.toLowerCase()} for this site. ${content.name} (${content.alias}) is a full-stack developer. Headline: ${content.headline}`;
  }

  if (text.includes("github") || text.includes("linkedin")) {
    return `GitHub: ${content.socialLinks.github}\nLinkedIn: ${content.socialLinks.linkedin}`;
  }

  if (text.includes("email") || text.includes("contact")) {
    return `You can email directly at ${content.contacts[0] || "sam.d3v.35@gmail.com"}, or use the Contact Agent tab here to send a message to Samuel.`;
  }

  if (text.includes("project") || text.includes("navigate") || text.includes("where") || text.includes("find")) {
    const quickList = content.featuredProjects.slice(0, 4).map((project) => project.name).join(" | ");
    return `Use the top nav or scroll to Featured Projects. You can also open /projects for the full list.\nFeatured right now: ${quickList}`;
  }

  return null;
}

function getGeneralFallbackReply(message: string, content: Awaited<ReturnType<typeof getSiteContent>>) {
  const trimmed = message.trim();
  if (!trimmed) {
    return `I'm ${AGENT_NAME}. Ask me anything about this site, or say things like weather, time, trivia, projects, or contact agent.`;
  }

  return [
    `I got your prompt: "${trimmed}".`,
    `I can help immediately with site guidance, project lookup, weather, time, trivia, and contact routing.`,
    `For this portfolio, try: "show featured projects", "open ${content.featuredProjects[0]?.slug || "projects"}", or "contact agent: Name | Email | Subject | Message".`
  ].join("\n");
}

async function getOpenAiReply(
  message: string,
  content: Awaited<ReturnType<typeof getSiteContent>>,
  history: Array<{ role: "assistant" | "user"; text: string }>
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = [
    `You are ${AGENT_NAME}, an on-site AI concierge for Samuel Farmer's resume website.`,
    `Personality style: ${AGENT_STYLE}.`,
    `Default user region: ${DEFAULT_REGION_LABEL}.`,
    `Default timezone: ${DEFAULT_TIMEZONE}.`,
    "Tone: friendly and practical.",
    "Be concise, helpful, confident, and practical.",
    "Keep responses to 1-4 short paragraphs unless the user asks for depth.",
    "You can answer navigation and profile questions based on the provided data.",
    "If asked for sensitive actions, refuse politely.",
    "Do not fabricate personal details beyond provided content."
  ].join(" ");

  const context = JSON.stringify(
    {
      name: content.name,
      alias: content.alias,
      headline: content.headline,
      contacts: content.contacts,
      socialLinks: content.socialLinks,
      featuredProjects: content.featuredProjects.map((project) => ({
        name: project.name,
        slug: project.slug,
        summary: project.summary,
        stack: project.stack
      }))
    },
    null,
    2
  );

  const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: `${system}\n\nSite context:\n${context}` }]
        },
        ...history.map((item) => ({
          role: item.role,
          content: [{ type: "input_text", text: item.text }]
        })),
        {
          role: "user",
          content: [{ type: "input_text", text: message }]
        }
      ],
      max_output_tokens: 250
    }),
    cache: "no-store"
  }, 18000);

  if (!response.ok) return null;

  const json = (await response.json()) as {
    output_text?: string;
  };

  return (json.output_text || "").trim() || null;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const perWindow = Number(process.env.ASSISTANT_RATE_LIMIT_PER_WINDOW || 20);
    const windowMs = Number(process.env.ASSISTANT_RATE_LIMIT_WINDOW_MS || 60 * 1000);
    const limit = await checkRateLimit(`assistant:${ip}`, perWindow, windowMs);
    if (!limit.allowed) {
      return NextResponse.json(
        { reply: "Too many requests right now. Please wait a moment and try again.", mood: "angry" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000))
          }
        }
      );
    }

    const body = (await req.json()) as ChatRequest;
    const rawMessage = (body.message || "").trim();
    const history: Array<{ role: "assistant" | "user"; text: string }> = Array.isArray(body.history)
      ? body.history
          .map((item) => ({
            role: (item.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
            text: String(item.text || "").trim()
          }))
          .filter((item) => item.text.length > 0)
          .slice(-10)
      : [];
    if (!rawMessage) {
      return NextResponse.json({ reply: `Send a message and I'll help you explore the site. — ${AGENT_NAME}`, mood: "happy" }, { status: 400 });
    }

    if (rawMessage.length > 1200) {
      return NextResponse.json({ reply: "That message is too long. Please send a shorter prompt.", mood: "angry" }, { status: 400 });
    }

    const { intent, fromHistory } = resolveIntent(rawMessage, history);

    if (intent === "weather") {
      try {
        const location = extractLocationWithContext(rawMessage, "weather", fromHistory);
        if (!location) {
          const fallback = await getDefaultWeatherReply();
          return NextResponse.json({
            reply: `${fallback} (Default region: ${DEFAULT_REGION_LABEL}. You can also ask: weather in Miami.)`,
            mood: inferMood(fallback, rawMessage)
          });
        }
        const reply = await getWeatherReply(location);
        return NextResponse.json({ reply, mood: inferMood(reply, rawMessage) });
      } catch {
        return NextResponse.json({
          reply: "I couldn't reach live weather right now, but I’m still here. Try again in a moment or ask for site navigation/time/trivia.",
          mood: "angry"
        });
      }
    }

    if (intent === "time") {
      try {
        const location = extractLocationWithContext(rawMessage, "time", fromHistory);
        if (!location) {
          const reply = `${getDefaultTimeReply()} (You can also ask: time in Tokyo.)`;
          return NextResponse.json({
            reply,
            mood: inferMood(reply, rawMessage)
          });
        }
        const reply = await getTimeReply(location);
        return NextResponse.json({ reply, mood: inferMood(reply, rawMessage) });
      } catch {
        const reply = `${getDefaultTimeReply()} (Live timezone lookup is temporarily unavailable.)`;
        return NextResponse.json({ reply, mood: inferMood(reply, rawMessage) });
      }
    }

    if (intent === "trivia") {
      try {
        const reply = await getTriviaReply();
        return NextResponse.json({ reply, mood: "curious" });
      } catch {
        return NextResponse.json({ reply: "Trivia is temporarily unavailable. Ask me again in a moment.", mood: "angry" });
      }
    }

    const content = await getSiteContent();

    try {
      const llmReply = await getOpenAiReply(rawMessage, content, history);
      if (llmReply) {
        return NextResponse.json({ reply: llmReply, mood: inferMood(llmReply, rawMessage) });
      }
    } catch {
      // Fall through to deterministic local fallback.
    }

    const fallback = getLocalReply(rawMessage, content);

    if (fallback) {
      return NextResponse.json({ reply: fallback, mood: inferMood(fallback, rawMessage) });
    }

    const general = getGeneralFallbackReply(rawMessage, content);
    return NextResponse.json({ reply: general, mood: inferMood(general, rawMessage) });
  } catch {
    return NextResponse.json(
      {
        reply: `I’m still online, but that request hit an internal issue. Please try again with a shorter prompt.`,
        mood: "angry"
      },
      { status: 500 }
    );
  }
}
