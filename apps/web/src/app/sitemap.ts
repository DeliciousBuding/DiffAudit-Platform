import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.DIFFAUDIT_PLATFORM_URL ?? "http://localhost:3000";

  const marketingPages = [
    { path: "", priority: 1.0, changeFreq: "monthly" as const },
    { path: "/docs", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/trial", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/login", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/register", priority: 0.5, changeFreq: "monthly" as const },
  ];

  const docPages = [
    { slug: "getting-started", priority: 0.8 },
    { slug: "architecture", priority: 0.7 },
    { slug: "attack-defense-matrix", priority: 0.7 },
  ];

  const entries: MetadataRoute.Sitemap = marketingPages.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  for (const doc of docPages) {
    entries.push({
      url: `${base}/docs/${doc.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: doc.priority,
    });
  }

  return entries;
}
