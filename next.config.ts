import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // due layout radice ((it) e [lang]): il 404 ha la sua pagina, app/global-not-found.tsx
  experimental: { globalNotFound: true },
};

export default nextConfig;
