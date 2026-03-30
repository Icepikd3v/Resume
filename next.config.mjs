/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.31:3000"],
  async rewrites() {
    const enabled = process.env.SHOWCASE_PROXY_ENABLED === "true";
    if (!enabled) return [];

    const routes = [];
    const mapping = [
      { source: "/showcase/rick-and-morty-react/:path*", target: process.env.SHOWCASE_RICK_MORTY_URL },
      { source: "/showcase/ready-set-travel/:path*", target: process.env.SHOWCASE_READY_SET_TRAVEL_URL },
      { source: "/showcase/icepik-octo-manager/:path*", target: process.env.SHOWCASE_OCTO_MANAGER_URL }
    ];

    for (const entry of mapping) {
      if (!entry.target) continue;
      const normalizedTarget = entry.target.replace("http://localhost", "http://127.0.0.1");
      const base = normalizedTarget.replace(/\/$/, "");
      routes.push({ source: entry.source, destination: `${base}/:path*` });
      routes.push({ source: entry.source.replace('/:path*', ''), destination: base });
    }

    return routes;
  }
};

export default nextConfig;
