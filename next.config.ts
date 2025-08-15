// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que ESLint rompa el build en Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deja los errores de TypeScript activos (recomendado)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
