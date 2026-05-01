import {
  SCHOOL_PORTAL_FEATURE_CARD_DEFAULTS,
  SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS,
  serializeJsonStringArray,
} from "../src/lib/we-brand-schools-defaults";

type SchoolPortalSeedPrisma = {
  schoolPortalSectionContent: {
    findFirst(args: unknown): Promise<{ id: number } | null>;
    update(args: unknown): Promise<unknown>;
    create(args: unknown): Promise<unknown>;
  };
  schoolPortalFeatureCard: {
    count(args?: unknown): Promise<number>;
    updateMany(args: unknown): Promise<unknown>;
    deleteMany(args?: unknown): Promise<unknown>;
    create(args: unknown): Promise<{ id: string }>;
    update(args: unknown): Promise<unknown>;
  };
};

export async function seedSchoolPortalContent(
  prisma: unknown,
  options: { replaceExisting?: boolean } = {},
) {
  const portalPrisma = prisma as SchoolPortalSeedPrisma;
  const shouldReplaceExisting = options.replaceExisting === true;

  const existingPortalContent =
    await portalPrisma.schoolPortalSectionContent.findFirst({
      orderBy: { id: "asc" },
      select: { id: true },
    });

  if (existingPortalContent && shouldReplaceExisting) {
    await portalPrisma.schoolPortalSectionContent.update({
      where: { id: existingPortalContent.id },
      data: SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS,
    });
  } else if (!existingPortalContent) {
    await portalPrisma.schoolPortalSectionContent.create({
      data: SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS,
    });
  }

  const existingCardCount = await portalPrisma.schoolPortalFeatureCard.count();

  if (existingCardCount > 0 && !shouldReplaceExisting) {
    return;
  }

  if (existingCardCount > 0) {
    await portalPrisma.schoolPortalFeatureCard.updateMany({
      data: { coverAssetId: null },
    });
    await portalPrisma.schoolPortalFeatureCard.deleteMany();
  }

  for (const card of SCHOOL_PORTAL_FEATURE_CARD_DEFAULTS) {
    const createdCard = await portalPrisma.schoolPortalFeatureCard.create({
      data: {
        id: card.id,
        title: card.title,
        summary: card.summary,
        description: card.description,
        features: serializeJsonStringArray(card.features),
        coverAssetId: null,
        youtubeUrl: card.youtubeUrl,
        isVisible: card.isVisible,
        position: card.position,
        assets: {
          create: card.assets.map((asset) => ({
            id: asset.id,
            publicId: asset.publicId,
            mediaType: asset.mediaType,
            thumbnailPublicId: asset.thumbnailPublicId,
            caption: asset.caption,
            position: asset.position,
          })),
        },
      },
    });

    if (card.coverAssetId) {
      await portalPrisma.schoolPortalFeatureCard.update({
        where: { id: createdCard.id },
        data: { coverAssetId: card.coverAssetId },
      });
    }
  }
}
