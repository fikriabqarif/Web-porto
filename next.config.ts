import type { NextConfig } from "next";

/**
 * Admin is served from a non-guessable path (ADMIN_SECRET_PATH in .env).
 * Normalised once here and handed to both server and client bundles, so
 * `process.env.NEXT_PUBLIC_ADMIN_PATH` resolves everywhere at build time.
 */
const adminBase = (() => {
  const raw = (process.env.ADMIN_SECRET_PATH ?? "").trim().replace(/\/+$/, "");
  if (!raw) return "/admin";
  return raw.startsWith("/") ? raw : `/${raw}`;
})();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ADMIN_PATH: adminBase,
  },
  images: {
    // Server-side optimisation needs a working libvips/sharp. On hosts where
    // libvips traps with an illegal instruction (e.g. x86 CPUs without SSE4.2),
    // every /_next/image request kills the process — set NEXT_IMAGE_UNOPTIMIZED=1
    // there and next/image serves the original files instead.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
    // Project images may come from Vercel Blob or any external https host.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    // Server Actions body limit: image uploads go through /api/upload, but
    // settings forms post small payloads. Keep a sane ceiling.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
