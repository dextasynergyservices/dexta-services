"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  ABOUT_CONTENT_TAG,
  ABOUT_EXPERTISE_TAG,
  ABOUT_MILESTONES_TAG,
  ABOUT_SPACE_TAG,
  ABOUT_TEAM_TAG,
  ABOUT_VALUES_TAG,
} from "@/lib/about-cache";
import {
  ABOUT_EXPERTISE_DEFAULTS,
  ABOUT_MILESTONE_DEFAULTS,
  ABOUT_PAGE_CONTENT_DEFAULTS,
  ABOUT_TEAM_MEMBER_DEFAULTS,
  ABOUT_VALUE_DEFAULTS,
  parseJsonStringArray,
  serializeJsonStringArray,
  type AboutExpertiseItemData,
  type AboutPageContentData,
  type AboutSpaceItemData,
  type AboutValueItemData,
} from "@/lib/about-defaults";
import { aboutPrisma } from "@/lib/about-prisma";
import prisma from "@/lib/prisma";
import {
  aboutExpertiseItemSchema,
  aboutMilestoneSchema,
  aboutPageContentSchema,
  aboutSpaceItemSchema,
  aboutTeamMemberSchema,
  aboutValueItemSchema,
  type AboutExpertiseItemInput,
  type AboutMilestoneInput,
  type AboutPageContentInput,
  type AboutSpaceItemInput,
  type AboutTeamMemberInput,
  type AboutValueItemInput,
} from "@/lib/validators";

type ActionResult = { success: boolean; message: string };
type ReorderDirection = "up" | "down";

export type AboutPageContentRow = AboutPageContentData;

export type AboutMilestoneRow = {
  id: string;
  year: string;
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
};

export type AboutExpertiseItemRow = {
  id: string;
  icon: AboutExpertiseItemData["icon"];
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  isVisible: boolean;
  position: number;
};

export type AboutTeamMemberRow = {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  funFact: string;
  portfolioUrl: string;
  showPortfolioButton: boolean;
  imagePublicId: string | null;
  isVisible: boolean;
  position: number;
};

export type AboutSpaceItemRow = {
  id: string;
  title: string;
  description: string;
  mediaType: AboutSpaceItemData["mediaType"];
  mediaPublicId: string | null;
  thumbnailPublicId: string | null;
  isVisible: boolean;
  position: number;
};

export type AboutValueItemRow = {
  id: string;
  icon: AboutValueItemData["icon"];
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
};

type AboutPageContentRecord = {
  id: number;
  heroEyebrow: string;
  heroHeadline: string;
  heroBody: string;
  heroBackgroundImagePublicId: string | null;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  heroStat4Value: string;
  heroStat4Label: string;
  storyLabel: string;
  storyTitle: string;
  storyBody1: string;
  storyBody2: string;
  storyHighlightLabel: string;
  storyHighlightTitle: string;
  storyHighlightBody: string;
  storyTrustedLabel: string;
  storyTrustedItems: string;
  expertiseLabel: string;
  expertiseTitle: string;
  expertiseBody: string;
  teamLabel: string;
  teamTitle: string;
  teamBody: string;
  cultureTitle: string;
  cultureBody: string;
  teamNoteLabel: string;
  teamPortfolioButtonText: string;
  spaceLabel: string;
  spaceTitle: string;
  spaceBody: string;
  valuesLabel: string;
  valuesTitle: string;
  valuesBody: string;
  ctaLabel: string;
  ctaTitle: string;
  ctaBody: string;
  ctaText: string;
  ctaHref: string;
};

type AboutTeamMemberRecord = {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string;
  funFact: string;
  portfolioUrl: string;
  showPortfolioButton: boolean;
  imagePublicId: string | null;
  isVisible: boolean;
  position: number;
};

export type AboutAdminData = {
  content: AboutPageContentRow;
  milestones: AboutMilestoneRow[];
  expertiseItems: AboutExpertiseItemRow[];
  teamMembers: AboutTeamMemberRow[];
  spaceItems: AboutSpaceItemRow[];
  valueItems: AboutValueItemRow[];
};

async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
}

function revalidateAboutContent() {
  updateTag(ABOUT_CONTENT_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function revalidateAboutMilestones() {
  updateTag(ABOUT_MILESTONES_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function revalidateAboutExpertise() {
  updateTag(ABOUT_EXPERTISE_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function revalidateAboutTeam() {
  updateTag(ABOUT_TEAM_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function revalidateAboutSpace() {
  updateTag(ABOUT_SPACE_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function getAboutSpaceItemDelegate() {
  const delegate = (
    aboutPrisma as typeof aboutPrisma & {
      aboutSpaceItem?: {
        count: () => Promise<number>;
        createMany: (args: {
          data: Array<{
            title: string;
            description: string;
            mediaType: AboutSpaceItemData["mediaType"];
            mediaPublicId: string | null;
            thumbnailPublicId: string | null;
            isVisible: boolean;
            position: number;
          }>;
        }) => Promise<unknown>;
        findMany: (args: { orderBy: { position: "asc" } }) => Promise<AboutSpaceItemRow[]>;
        create: (args: { data: AboutSpaceItemInput }) => Promise<unknown>;
        findUnique: (args: { where: { id: string } }) => Promise<
          | (AboutSpaceItemRow & {
              id: string;
            })
          | null
        >;
        update: (args: {
          where: { id: string };
          data: Partial<AboutSpaceItemInput> | { position: number };
        }) => Promise<unknown>;
        delete: (args: { where: { id: string } }) => Promise<unknown>;
      };
    }
  ).aboutSpaceItem;

  return delegate ?? null;
}

function revalidateAboutValues() {
  updateTag(ABOUT_VALUES_TAG);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

function normalizeAboutPageContent(
  data: AboutPageContentInput,
): AboutPageContentRow {
  return {
    heroEyebrow: data.heroEyebrow,
    heroHeadline: data.heroHeadline,
    heroBody: data.heroBody,
    heroBackgroundImagePublicId: data.heroBackgroundImagePublicId ?? null,
    heroPrimaryCtaText: data.heroPrimaryCtaText,
    heroPrimaryCtaHref: data.heroPrimaryCtaHref,
    heroSecondaryCtaText: data.heroSecondaryCtaText,
    heroSecondaryCtaHref: data.heroSecondaryCtaHref,
    heroStat1Value: data.heroStat1Value,
    heroStat1Label: data.heroStat1Label,
    heroStat2Value: data.heroStat2Value,
    heroStat2Label: data.heroStat2Label,
    heroStat3Value: data.heroStat3Value,
    heroStat3Label: data.heroStat3Label,
    heroStat4Value: data.heroStat4Value,
    heroStat4Label: data.heroStat4Label,
    storyLabel: data.storyLabel,
    storyTitle: data.storyTitle,
    storyBody1: data.storyBody1,
    storyBody2: data.storyBody2,
    storyHighlightLabel: data.storyHighlightLabel,
    storyHighlightTitle: data.storyHighlightTitle,
    storyHighlightBody: data.storyHighlightBody,
    storyTrustedLabel: data.storyTrustedLabel,
    storyTrustedItems: parseJsonStringArray(data.storyTrustedItems),
    expertiseLabel: data.expertiseLabel,
    expertiseTitle: data.expertiseTitle,
    expertiseBody: data.expertiseBody,
    teamLabel: data.teamLabel,
    teamTitle: data.teamTitle,
    teamBody: data.teamBody,
    cultureTitle: data.cultureTitle,
    cultureBody: data.cultureBody,
    teamNoteLabel: data.teamNoteLabel,
    teamPortfolioButtonText: data.teamPortfolioButtonText,
    spaceLabel: data.spaceLabel,
    spaceTitle: data.spaceTitle,
    spaceBody: data.spaceBody,
    valuesLabel: data.valuesLabel,
    valuesTitle: data.valuesTitle,
    valuesBody: data.valuesBody,
    ctaLabel: data.ctaLabel,
    ctaTitle: data.ctaTitle,
    ctaBody: data.ctaBody,
    ctaText: data.ctaText,
    ctaHref: data.ctaHref,
  };
}

function toAboutPageContentInput(
  content: AboutPageContentRow,
): AboutPageContentInput {
  return {
    ...content,
    storyTrustedItems: serializeJsonStringArray(content.storyTrustedItems),
  };
}

function mapAboutPageContentRecord(
  content: AboutPageContentRecord | null,
): AboutPageContentRow {
  if (!content) {
    return ABOUT_PAGE_CONTENT_DEFAULTS;
  }

  return {
    heroEyebrow: content.heroEyebrow,
    heroHeadline: content.heroHeadline,
    heroBody: content.heroBody,
    heroBackgroundImagePublicId: content.heroBackgroundImagePublicId,
    heroPrimaryCtaText: content.heroPrimaryCtaText,
    heroPrimaryCtaHref: content.heroPrimaryCtaHref,
    heroSecondaryCtaText: content.heroSecondaryCtaText,
    heroSecondaryCtaHref: content.heroSecondaryCtaHref,
    heroStat1Value: content.heroStat1Value,
    heroStat1Label: content.heroStat1Label,
    heroStat2Value: content.heroStat2Value,
    heroStat2Label: content.heroStat2Label,
    heroStat3Value: content.heroStat3Value,
    heroStat3Label: content.heroStat3Label,
    heroStat4Value: content.heroStat4Value,
    heroStat4Label: content.heroStat4Label,
    storyLabel: content.storyLabel,
    storyTitle: content.storyTitle,
    storyBody1: content.storyBody1,
    storyBody2: content.storyBody2,
    storyHighlightLabel: content.storyHighlightLabel,
    storyHighlightTitle: content.storyHighlightTitle,
    storyHighlightBody: content.storyHighlightBody,
    storyTrustedLabel: content.storyTrustedLabel,
    storyTrustedItems: parseJsonStringArray(content.storyTrustedItems),
    expertiseLabel: content.expertiseLabel,
    expertiseTitle: content.expertiseTitle,
    expertiseBody: content.expertiseBody,
    teamLabel: content.teamLabel,
    teamTitle: content.teamTitle,
    teamBody: content.teamBody,
    cultureTitle: content.cultureTitle,
    cultureBody: content.cultureBody,
    teamNoteLabel: content.teamNoteLabel,
    teamPortfolioButtonText: content.teamPortfolioButtonText,
    spaceLabel: content.spaceLabel,
    spaceTitle: content.spaceTitle,
    spaceBody: content.spaceBody,
    valuesLabel: content.valuesLabel,
    valuesTitle: content.valuesTitle,
    valuesBody: content.valuesBody,
    ctaLabel: content.ctaLabel,
    ctaTitle: content.ctaTitle,
    ctaBody: content.ctaBody,
    ctaText: content.ctaText,
    ctaHref: content.ctaHref,
  };
}

function mapMilestoneRow(row: {
  id: string;
  year: string;
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
}): AboutMilestoneRow {
  return {
    id: row.id,
    year: row.year,
    title: row.title,
    description: row.description,
    isVisible: row.isVisible,
    position: row.position,
  };
}

function mapExpertiseRow(row: {
  id: string;
  icon: AboutExpertiseItemData["icon"];
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  isVisible: boolean;
  position: number;
}): AboutExpertiseItemRow {
  return {
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
    metricLabel: row.metricLabel,
    metricValue: row.metricValue,
    isVisible: row.isVisible,
    position: row.position,
  };
}

function mapTeamMemberRow(row: {
  id: string;
  name: string;
  role: string;
  bio: string;
  expertise: string;
  funFact: string;
  portfolioUrl: string;
  showPortfolioButton: boolean;
  imagePublicId: string | null;
  isVisible: boolean;
  position: number;
}): AboutTeamMemberRow {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    expertise: parseJsonStringArray(row.expertise),
    funFact: row.funFact,
    portfolioUrl: row.portfolioUrl,
    showPortfolioButton: row.showPortfolioButton,
    imagePublicId: row.imagePublicId,
    isVisible: row.isVisible,
    position: row.position,
  };
}

function mapSpaceRow(row: {
  id: string;
  title: string;
  description: string;
  mediaType: AboutSpaceItemData["mediaType"];
  mediaPublicId: string | null;
  thumbnailPublicId: string | null;
  isVisible: boolean;
  position: number;
}): AboutSpaceItemRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    mediaType: row.mediaType,
    mediaPublicId: row.mediaPublicId,
    thumbnailPublicId: row.thumbnailPublicId,
    isVisible: row.isVisible,
    position: row.position,
  };
}

function mapValueRow(row: {
  id: string;
  icon: AboutValueItemData["icon"];
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
}): AboutValueItemRow {
  return {
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
    isVisible: row.isVisible,
    position: row.position,
  };
}

async function ensureAboutSeeded() {
  const existingContent = (await aboutPrisma.aboutPageContent.findFirst({
    orderBy: { id: "asc" },
  })) as AboutPageContentRecord | null;

  if (!existingContent) {
    await aboutPrisma.aboutPageContent.create({
      data: {
        ...ABOUT_PAGE_CONTENT_DEFAULTS,
        storyTrustedItems: serializeJsonStringArray(
          ABOUT_PAGE_CONTENT_DEFAULTS.storyTrustedItems,
        ),
      },
    });
  }

  if ((await aboutPrisma.aboutMilestone.count()) === 0) {
    await aboutPrisma.aboutMilestone.createMany({
      data: ABOUT_MILESTONE_DEFAULTS.map((item) => ({
        year: item.year,
        title: item.title,
        description: item.description,
        isVisible: item.isVisible,
        position: item.position,
      })),
    });
  }

  if ((await aboutPrisma.aboutExpertiseItem.count()) === 0) {
    await aboutPrisma.aboutExpertiseItem.createMany({
      data: ABOUT_EXPERTISE_DEFAULTS.map((item) => ({
        icon: item.icon,
        title: item.title,
        description: item.description,
        metricLabel: item.metricLabel,
        metricValue: item.metricValue,
        isVisible: item.isVisible,
        position: item.position,
      })),
    });
  }

  if ((await aboutPrisma.aboutTeamMember.count()) === 0) {
    await aboutPrisma.aboutTeamMember.createMany({
      data: ABOUT_TEAM_MEMBER_DEFAULTS.map((item) => ({
        name: item.name,
        role: item.role,
        bio: item.bio,
        expertise: serializeJsonStringArray(item.expertise),
        funFact: item.funFact,
        portfolioUrl: item.portfolioUrl,
        showPortfolioButton: item.showPortfolioButton,
        imagePublicId: item.imagePublicId,
        isVisible: item.isVisible,
        position: item.position,
      })),
    });
  }

  if ((await aboutPrisma.aboutValueItem.count()) === 0) {
    await aboutPrisma.aboutValueItem.createMany({
      data: ABOUT_VALUE_DEFAULTS.map((item) => ({
        icon: item.icon,
        title: item.title,
        description: item.description,
        isVisible: item.isVisible,
        position: item.position,
      })),
    });
  }
}

export async function getAboutAdminData(): Promise<AboutAdminData> {
  await requireAuth();
  await ensureAboutSeeded();
  const aboutSpaceItem = getAboutSpaceItemDelegate();

  const [content, milestones, expertiseItems, teamMembers, spaceItems, valueItems] =
    (await Promise.all([
      aboutPrisma.aboutPageContent.findFirst({ orderBy: { id: "asc" } }),
      aboutPrisma.aboutMilestone.findMany({ orderBy: { position: "asc" } }),
      aboutPrisma.aboutExpertiseItem.findMany({ orderBy: { position: "asc" } }),
      aboutPrisma.aboutTeamMember.findMany({ orderBy: { position: "asc" } }),
      aboutSpaceItem
        ? aboutSpaceItem.findMany({ orderBy: { position: "asc" } })
        : Promise.resolve([] as AboutSpaceItemRow[]),
      aboutPrisma.aboutValueItem.findMany({ orderBy: { position: "asc" } }),
    ])) as [
      AboutPageContentRecord | null,
      AboutMilestoneRow[],
      AboutExpertiseItemRow[],
      AboutTeamMemberRecord[],
      AboutSpaceItemRow[],
      AboutValueItemRow[],
    ];

  return {
    content: mapAboutPageContentRecord(content),
    milestones: milestones.map((item) => mapMilestoneRow(item)),
    expertiseItems: expertiseItems.map((item) =>
      mapExpertiseRow({
        id: item.id,
        icon: item.icon,
        title: item.title,
        description: item.description,
        metricLabel: item.metricLabel,
        metricValue: item.metricValue,
        isVisible: item.isVisible,
        position: item.position,
      }),
    ),
    teamMembers: teamMembers.map((item) => mapTeamMemberRow(item)),
    spaceItems: spaceItems.map((item) => mapSpaceRow(item)),
    valueItems: valueItems.map((item) =>
      mapValueRow({
        id: item.id,
        icon: item.icon,
        title: item.title,
        description: item.description,
        isVisible: item.isVisible,
        position: item.position,
      }),
    ),
  };
}

export async function updateAboutPageContent(
  data: AboutPageContentInput,
): Promise<ActionResult> {
  await requireAuth();

  const parsed = aboutPageContentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid content data.",
    };
  }

  const normalized = normalizeAboutPageContent(parsed.data);
  const existingContent = (await aboutPrisma.aboutPageContent.findFirst({
    orderBy: { id: "asc" },
  })) as AboutPageContentRecord | null;
  const serializedTrustedItems = serializeJsonStringArray(
    normalized.storyTrustedItems,
  );

  if (existingContent) {
    await aboutPrisma.aboutPageContent.update({
      where: { id: existingContent.id },
      data: {
        ...normalized,
        storyTrustedItems: serializedTrustedItems,
      },
    });
  } else {
    await aboutPrisma.aboutPageContent.create({
      data: {
        ...normalized,
        storyTrustedItems: serializedTrustedItems,
      },
    });
  }

  revalidateAboutContent();
  return { success: true, message: "About page content updated." };
}

export async function updateAboutPageContentSection(
  data: Partial<AboutPageContentInput>,
): Promise<ActionResult> {
  await requireAuth();
  await ensureAboutSeeded();

  const current = (await aboutPrisma.aboutPageContent.findFirst({
    orderBy: { id: "asc" },
  })) as AboutPageContentRecord | null;

  const merged = {
    ...toAboutPageContentInput(mapAboutPageContentRecord(current)),
    ...data,
  };

  const parsed = aboutPageContentSchema.safeParse(merged);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid content data.",
    };
  }

  const normalized = normalizeAboutPageContent(parsed.data);
  const serializedTrustedItems = serializeJsonStringArray(
    normalized.storyTrustedItems,
  );

  if (current) {
    await aboutPrisma.aboutPageContent.update({
      where: { id: current.id },
      data: {
        ...normalized,
        storyTrustedItems: serializedTrustedItems,
      },
    });
  } else {
    await aboutPrisma.aboutPageContent.create({
      data: {
        ...normalized,
        storyTrustedItems: serializedTrustedItems,
      },
    });
  }

  revalidateAboutContent();
  return { success: true, message: "About section updated." };
}

function getReorderSwap<T extends { id: string; position: number }>(
  rows: T[],
  id: string,
  direction: ReorderDirection,
) {
  const currentIndex = rows.findIndex((row) => row.id === id);
  if (currentIndex === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return null;
  }

  return {
    current: rows[currentIndex],
    target: rows[targetIndex],
  };
}

export async function createAboutMilestone(
  data: AboutMilestoneInput,
): Promise<ActionResult> {
  await requireAuth();

  const position = await aboutPrisma.aboutMilestone.count();
  const parsed = aboutMilestoneSchema.safeParse({ ...data, position });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid milestone data.",
    };
  }

  await aboutPrisma.aboutMilestone.create({ data: parsed.data });
  revalidateAboutMilestones();
  return { success: true, message: "Milestone added." };
}

export async function updateAboutMilestone(
  id: string,
  data: AboutMilestoneInput,
): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutMilestone.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Milestone not found." };
  }

  const parsed = aboutMilestoneSchema.safeParse({
    ...data,
    position: existing.position,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid milestone data.",
    };
  }

  await aboutPrisma.aboutMilestone.update({
    where: { id },
    data: parsed.data,
  });

  revalidateAboutMilestones();
  return { success: true, message: "Milestone updated." };
}

export async function deleteAboutMilestone(id: string): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutMilestone.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Milestone not found." };
  }

  await aboutPrisma.aboutMilestone.delete({ where: { id } });

  const rows = await aboutPrisma.aboutMilestone.findMany({
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    rows.map((row: { id: string }, index: number) =>
      aboutPrisma.aboutMilestone.update({
        where: { id: row.id },
        data: { position: index },
      }),
    ),
  );

  revalidateAboutMilestones();
  return { success: true, message: "Milestone removed." };
}

export async function reorderAboutMilestones(
  id: string,
  direction: ReorderDirection,
): Promise<ActionResult> {
  await requireAuth();

  const rows = await aboutPrisma.aboutMilestone.findMany({
    orderBy: { position: "asc" },
  });
  const swap = getReorderSwap(rows, id, direction);
  if (!swap) {
    return { success: false, message: "Unable to move this milestone." };
  }

  await prisma.$transaction([
    aboutPrisma.aboutMilestone.update({
      where: { id: swap.current.id },
      data: { position: swap.target.position },
    }),
    aboutPrisma.aboutMilestone.update({
      where: { id: swap.target.id },
      data: { position: swap.current.position },
    }),
  ]);

  revalidateAboutMilestones();
  return { success: true, message: "Milestone reordered." };
}

export async function createAboutExpertiseItem(
  data: AboutExpertiseItemInput,
): Promise<ActionResult> {
  await requireAuth();

  const position = await aboutPrisma.aboutExpertiseItem.count();
  const parsed = aboutExpertiseItemSchema.safeParse({ ...data, position });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid expertise item.",
    };
  }

  await aboutPrisma.aboutExpertiseItem.create({ data: parsed.data });
  revalidateAboutExpertise();
  return { success: true, message: "Expertise item added." };
}

export async function updateAboutExpertiseItem(
  id: string,
  data: AboutExpertiseItemInput,
): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutExpertiseItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Expertise item not found." };
  }

  const parsed = aboutExpertiseItemSchema.safeParse({
    ...data,
    position: existing.position,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid expertise item.",
    };
  }

  await aboutPrisma.aboutExpertiseItem.update({
    where: { id },
    data: parsed.data,
  });

  revalidateAboutExpertise();
  return { success: true, message: "Expertise item updated." };
}

export async function deleteAboutExpertiseItem(
  id: string,
): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutExpertiseItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Expertise item not found." };
  }

  await aboutPrisma.aboutExpertiseItem.delete({ where: { id } });

  const rows = await aboutPrisma.aboutExpertiseItem.findMany({
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    rows.map((row: { id: string }, index: number) =>
      aboutPrisma.aboutExpertiseItem.update({
        where: { id: row.id },
        data: { position: index },
      }),
    ),
  );

  revalidateAboutExpertise();
  return { success: true, message: "Expertise item removed." };
}

export async function reorderAboutExpertiseItems(
  id: string,
  direction: ReorderDirection,
): Promise<ActionResult> {
  await requireAuth();

  const rows = await aboutPrisma.aboutExpertiseItem.findMany({
    orderBy: { position: "asc" },
  });
  const swap = getReorderSwap(rows, id, direction);
  if (!swap) {
    return { success: false, message: "Unable to move this expertise item." };
  }

  await prisma.$transaction([
    aboutPrisma.aboutExpertiseItem.update({
      where: { id: swap.current.id },
      data: { position: swap.target.position },
    }),
    aboutPrisma.aboutExpertiseItem.update({
      where: { id: swap.target.id },
      data: { position: swap.current.position },
    }),
  ]);

  revalidateAboutExpertise();
  return { success: true, message: "Expertise item reordered." };
}

function normalizeTeamMember(
  data: AboutTeamMemberInput,
  position: number,
): Omit<AboutTeamMemberRow, "id"> {
  return {
    name: data.name,
    role: data.role,
    bio: data.bio,
    expertise: parseJsonStringArray(data.expertise),
    funFact: data.funFact,
    portfolioUrl: data.portfolioUrl,
    showPortfolioButton: data.showPortfolioButton,
    imagePublicId: data.imagePublicId ?? null,
    isVisible: data.isVisible,
    position,
  };
}

export async function createAboutTeamMember(
  data: AboutTeamMemberInput,
): Promise<ActionResult> {
  await requireAuth();

  const position = await aboutPrisma.aboutTeamMember.count();
  const parsed = aboutTeamMemberSchema.safeParse({ ...data, position });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid team member.",
    };
  }

  if (!parsed.data.imagePublicId?.trim()) {
    return { success: false, message: "Professional picture is required." };
  }

  const normalized = normalizeTeamMember(parsed.data, position);

  await aboutPrisma.aboutTeamMember.create({
    data: {
      ...normalized,
      expertise: serializeJsonStringArray(normalized.expertise),
    },
  });

  revalidateAboutTeam();
  return { success: true, message: "Team member added." };
}

export async function updateAboutTeamMember(
  id: string,
  data: AboutTeamMemberInput,
): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutTeamMember.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Team member not found." };
  }

  const parsed = aboutTeamMemberSchema.safeParse({
    ...data,
    position: existing.position,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid team member.",
    };
  }

  const normalized = normalizeTeamMember(parsed.data, existing.position);

  await aboutPrisma.aboutTeamMember.update({
    where: { id },
    data: {
      ...normalized,
      expertise: serializeJsonStringArray(normalized.expertise),
    },
  });

  revalidateAboutTeam();
  return { success: true, message: "Team member updated." };
}

export async function deleteAboutTeamMember(id: string): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutTeamMember.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Team member not found." };
  }

  await aboutPrisma.aboutTeamMember.delete({ where: { id } });

  const rows = await aboutPrisma.aboutTeamMember.findMany({
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    rows.map((row: { id: string }, index: number) =>
      aboutPrisma.aboutTeamMember.update({
        where: { id: row.id },
        data: { position: index },
      }),
    ),
  );

  revalidateAboutTeam();
  return { success: true, message: "Team member removed." };
}

export async function reorderAboutTeamMembers(
  id: string,
  direction: ReorderDirection,
): Promise<ActionResult> {
  await requireAuth();

  const rows = await aboutPrisma.aboutTeamMember.findMany({
    orderBy: { position: "asc" },
  });
  const swap = getReorderSwap(rows, id, direction);
  if (!swap) {
    return { success: false, message: "Unable to move this team member." };
  }

  await prisma.$transaction([
    aboutPrisma.aboutTeamMember.update({
      where: { id: swap.current.id },
      data: { position: swap.target.position },
    }),
    aboutPrisma.aboutTeamMember.update({
      where: { id: swap.target.id },
      data: { position: swap.current.position },
    }),
  ]);

  revalidateAboutTeam();
  return { success: true, message: "Team member reordered." };
}

export async function createAboutSpaceItem(
  data: AboutSpaceItemInput,
): Promise<ActionResult> {
  await requireAuth();
  const aboutSpaceItem = getAboutSpaceItemDelegate();
  if (!aboutSpaceItem) {
    return {
      success: false,
      message: "Our Space is unavailable until Prisma is regenerated and the dev server is restarted.",
    };
  }

  const position = await aboutSpaceItem.count();
  const parsed = aboutSpaceItemSchema.safeParse({ ...data, position });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid space item.",
    };
  }

  await aboutSpaceItem.create({ data: parsed.data });
  revalidateAboutSpace();
  return { success: true, message: "Space item added." };
}

export async function updateAboutSpaceItem(
  id: string,
  data: AboutSpaceItemInput,
): Promise<ActionResult> {
  await requireAuth();
  const aboutSpaceItem = getAboutSpaceItemDelegate();
  if (!aboutSpaceItem) {
    return {
      success: false,
      message: "Our Space is unavailable until Prisma is regenerated and the dev server is restarted.",
    };
  }

  const existing = await aboutSpaceItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Space item not found." };
  }

  const parsed = aboutSpaceItemSchema.safeParse({
    ...data,
    position: existing.position,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid space item.",
    };
  }

  await aboutSpaceItem.update({
    where: { id },
    data: parsed.data,
  });

  revalidateAboutSpace();
  return { success: true, message: "Space item updated." };
}

export async function deleteAboutSpaceItem(id: string): Promise<ActionResult> {
  await requireAuth();
  const aboutSpaceItem = getAboutSpaceItemDelegate();
  if (!aboutSpaceItem) {
    return {
      success: false,
      message: "Our Space is unavailable until Prisma is regenerated and the dev server is restarted.",
    };
  }

  const existing = await aboutSpaceItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Space item not found." };
  }

  await aboutSpaceItem.delete({ where: { id } });

  const rows = await aboutSpaceItem.findMany({
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    rows.map((row: { id: string }, index: number) =>
      aboutSpaceItem.update({
        where: { id: row.id },
        data: { position: index },
      }),
    ),
  );

  revalidateAboutSpace();
  return { success: true, message: "Space item removed." };
}

export async function reorderAboutSpaceItems(
  id: string,
  direction: ReorderDirection,
): Promise<ActionResult> {
  await requireAuth();
  const aboutSpaceItem = getAboutSpaceItemDelegate();
  if (!aboutSpaceItem) {
    return {
      success: false,
      message: "Our Space is unavailable until Prisma is regenerated and the dev server is restarted.",
    };
  }

  const rows = await aboutSpaceItem.findMany({
    orderBy: { position: "asc" },
  });
  const swap = getReorderSwap(rows, id, direction);
  if (!swap) {
    return { success: false, message: "Unable to move this space item." };
  }

  await prisma.$transaction([
    aboutSpaceItem.update({
      where: { id: swap.current.id },
      data: { position: swap.target.position },
    }),
    aboutSpaceItem.update({
      where: { id: swap.target.id },
      data: { position: swap.current.position },
    }),
  ]);

  revalidateAboutSpace();
  return { success: true, message: "Space item reordered." };
}

export async function createAboutValueItem(
  data: AboutValueItemInput,
): Promise<ActionResult> {
  await requireAuth();

  const position = await aboutPrisma.aboutValueItem.count();
  const parsed = aboutValueItemSchema.safeParse({ ...data, position });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid value item.",
    };
  }

  await aboutPrisma.aboutValueItem.create({ data: parsed.data });
  revalidateAboutValues();
  return { success: true, message: "Value item added." };
}

export async function updateAboutValueItem(
  id: string,
  data: AboutValueItemInput,
): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutValueItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Value item not found." };
  }

  const parsed = aboutValueItemSchema.safeParse({
    ...data,
    position: existing.position,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid value item.",
    };
  }

  await aboutPrisma.aboutValueItem.update({
    where: { id },
    data: parsed.data,
  });

  revalidateAboutValues();
  return { success: true, message: "Value item updated." };
}

export async function deleteAboutValueItem(id: string): Promise<ActionResult> {
  await requireAuth();

  const existing = await aboutPrisma.aboutValueItem.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, message: "Value item not found." };
  }

  await aboutPrisma.aboutValueItem.delete({ where: { id } });

  const rows = await aboutPrisma.aboutValueItem.findMany({
    orderBy: { position: "asc" },
  });
  await prisma.$transaction(
    rows.map((row: { id: string }, index: number) =>
      aboutPrisma.aboutValueItem.update({
        where: { id: row.id },
        data: { position: index },
      }),
    ),
  );

  revalidateAboutValues();
  return { success: true, message: "Value item removed." };
}

export async function reorderAboutValueItems(
  id: string,
  direction: ReorderDirection,
): Promise<ActionResult> {
  await requireAuth();

  const rows = await aboutPrisma.aboutValueItem.findMany({
    orderBy: { position: "asc" },
  });
  const swap = getReorderSwap(rows, id, direction);
  if (!swap) {
    return { success: false, message: "Unable to move this value item." };
  }

  await prisma.$transaction([
    aboutPrisma.aboutValueItem.update({
      where: { id: swap.current.id },
      data: { position: swap.target.position },
    }),
    aboutPrisma.aboutValueItem.update({
      where: { id: swap.target.id },
      data: { position: swap.current.position },
    }),
  ]);

  revalidateAboutValues();
  return { success: true, message: "Value item reordered." };
}
