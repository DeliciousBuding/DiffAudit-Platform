import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/workspace/", "/_next/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
