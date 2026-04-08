import { unstable_cache } from "next/cache";
import { resolveProjectSectionCardColor } from "@/lib/project-section";
import prisma from "@/lib/prisma";
import { ServicesSection } from "./services-section";

export type ServiceType = "DESIGN" | "BUILD" | "PRINT";

export type ServiceFeaturedMediaItem = {
  id: string;
  title: string;
  mediaPublicId: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailPublicId: string | null;
  objectPosition?: string | null;
};

export type ServicePanelItem = {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  iconPublicId: string | null;
  cardColor: string;
  featuredItems: ServiceFeaturedMediaItem[];
};

const SERVICE_ORDER: ServiceType[] = ["DESIGN", "BUILD", "PRINT"];

const DEFAULT_SERVICE_COPY: Record<
  ServiceType,
  Omit<ServicePanelItem, "featuredItems">
> = {
  DESIGN: {
    id: "default-design",
    type: "DESIGN",
    title: "DESIGN",
    description:
      "Visual Domination. We don't just make things pretty — we make them impossible to ignore.",
    iconPublicId: null,
    cardColor: "#c084fc",
  },
  BUILD: {
    id: "default-build",
    type: "BUILD",
    title: "BUILD",
    description:
      "Digital Engineering. Websites and software that work as hard as you do and look better doing it.",
    iconPublicId: null,
    cardColor: "#22d3ee",
  },
  PRINT: {
    id: "default-print",
    type: "PRINT",
    title: "PRINT",
    description:
      "Ink That Speaks. From paper to billboard, we put your brand in the real world, loud and proud.",
    iconPublicId: null,
    cardColor: "#f472b6",
  },
};

async function fetchServicesData(): Promise<{
  services: ServicePanelItem[];
  sectionBackgroundImagePublicId: string | null;
}> {
  const [contentRows, featuredRows] = await Promise.all([
    prisma.serviceContent.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        iconPublicId: true,
        cardColor: true,
        backgroundImagePublicId: true,
      },
    }),
    prisma.portfolioItem.findMany({
      where: { isFeatured: true },
      orderBy: [{ serviceType: "asc" }, { position: "asc" }],
      select: {
        id: true,
        serviceType: true,
        title: true,
        objectPosition: true,
        mediaPublicId: true,
        mediaType: true,
        thumbnailPublicId: true,
        coverAssetId: true,
        assets: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            publicId: true,
            mediaType: true,
            thumbnailPublicId: true,
          },
        },
      },
    }),
  ]);

  const contentMap = new Map(
    contentRows.map((row) => [
      row.type as ServiceType,
      {
        id: row.id,
        type: row.type as ServiceType,
        title: row.title,
        description: row.description,
        iconPublicId: row.iconPublicId,
        cardColor: resolveProjectSectionCardColor(
          row.type as ServiceType,
          row.cardColor,
        ),
      },
    ]),
  );

  const featuredMap = new Map<ServiceType, ServiceFeaturedMediaItem[]>(
    SERVICE_ORDER.map((type) => [type, []]),
  );

  for (const row of featuredRows) {
    const bucket = featuredMap.get(row.serviceType as ServiceType);
    if (!bucket) continue;

    const preferredAsset =
      row.assets.find((asset) => asset.id === row.coverAssetId) ?? row.assets[0] ?? null;

    bucket.push({
      id: row.id,
      title: row.title,
      mediaPublicId: preferredAsset?.publicId ?? row.mediaPublicId,
      mediaType: preferredAsset?.mediaType ?? row.mediaType,
      thumbnailPublicId:
        preferredAsset?.thumbnailPublicId ?? row.thumbnailPublicId,
      objectPosition: row.objectPosition,
    });
  }

  const sectionBackgroundImagePublicId =
    contentRows.find((row) => row.backgroundImagePublicId)?.backgroundImagePublicId ??
    null;

  return {
    services: SERVICE_ORDER.map((type) => ({
      ...(contentMap.get(type) ?? DEFAULT_SERVICE_COPY[type]),
      featuredItems: featuredMap.get(type) ?? [],
    })),
    sectionBackgroundImagePublicId,
  };
}

const getCachedServicesData = unstable_cache(
  fetchServicesData,
  ["services-content"],
  {
    tags: ["services-content"],
    revalidate: 60,
  },
);

async function getServicesData() {
  if (process.env.NODE_ENV === "development") {
    return fetchServicesData();
  }

  return getCachedServicesData();
}

export default async function ServicesWrapper() {
  const data = await getServicesData().catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    console.warn(
      `[ServicesWrapper] Falling back to default project section copy because the database is unavailable: ${message}`,
    );

    return {
      services: SERVICE_ORDER.map((type) => ({
        ...DEFAULT_SERVICE_COPY[type],
        featuredItems: [],
      })),
      sectionBackgroundImagePublicId: null,
    };
  });

  return (
    <ServicesSection
      services={data.services}
      sectionBackgroundImagePublicId={data.sectionBackgroundImagePublicId}
    />
  );
}
