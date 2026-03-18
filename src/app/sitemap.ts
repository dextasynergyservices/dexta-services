import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://dexta.synergy";

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const eventPages = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...eventPages,
  ];
}
