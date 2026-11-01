import type { MetadataRoute } from "next";
import { site } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  const base = site.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
