"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layout,
  Palette,
  Play,
  Printer,
  RotateCcw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import type {
  PortfolioAsset,
  PortfolioItem,
  PortfolioTab,
  PortfolioTabCounts,
  ProjectsHeroData,
  PortfolioTabContentMap,
} from "@/lib/api";

type ProjectPageProps = {
  activeTab: PortfolioTab;
  projects: PortfolioItem[];
  counts: PortfolioTabCounts;
  heroContent: ProjectsHeroData;
  tabContent: PortfolioTabContentMap;
};

const PROJECTS_PER_PAGE = 6;
const IMAGE_ZOOM_MIN = 1;
const IMAGE_ZOOM_MAX = 2.5;
const IMAGE_ZOOM_STEP = 0.25;
const PROJECT_CARD_ASPECT = "aspect-[16/10]";

const TAB_CONFIG: {
  id: PortfolioTab;
  label: string;
  icon: typeof Palette;
  accent: string;
  accentSoft: string;
}[] = [
  {
    id: "design",
    label: "Design",
    icon: Palette,
    accent: "text-[#000c99]",
    accentSoft: "border-[#000c99]/15 bg-[#000c99]/[0.06]",
  },
  {
    id: "build",
    label: "Build",
    icon: Layout,
    accent: "text-[#00abff]",
    accentSoft: "border-[#00abff]/20 bg-[#00abff]/10",
  },
  {
    id: "print",
    label: "Print",
    icon: Printer,
    accent: "text-[#0057c2]",
    accentSoft: "border-[#0057c2]/15 bg-[#0057c2]/[0.07]",
  },
];

// ─── Gallery helpers ──────────────────────────────────────────────────────────

type GalleryItem = {
  id: string;
  publicId: string;
  mediaType: PortfolioAsset["mediaType"];
  thumbnailPublicId: string | null;
  caption: string | null;
};

function getProjectGallery(project: PortfolioItem): GalleryItem[] {
  if (project.assets.length > 0) {
    return project.assets.map((a) => ({
      id: a.id,
      publicId: a.publicId,
      mediaType: a.mediaType,
      thumbnailPublicId: a.thumbnailPublicId,
      caption: a.caption,
    }));
  }
  return [
    {
      id: project.id,
      publicId: project.mediaPublicId,
      mediaType: project.mediaType,
      thumbnailPublicId: project.thumbnailPublicId,
      caption: null,
    },
  ];
}

function getPreferredProjectAsset(project: PortfolioItem) {
  return (
    project.assets.find((asset) => asset.id === project.coverAssetId) ??
    project.assets[0] ??
    null
  );
}

function getInitialGalleryIndex(project: PortfolioItem) {
  if (project.assets.length === 0) {
    return 0;
  }

  const preferredIndex = project.assets.findIndex(
    (asset) => asset.id === project.coverAssetId,
  );

  return preferredIndex >= 0 ? preferredIndex : 0;
}

function getImageUrl(publicId: string, width: number, height: number) {
  return getCloudinaryUrl(publicId, {
    c: "fill",
    f: "auto",
    g: "auto",
    q: "auto",
    w: width,
    h: height,
  });
}

function getContainUrl(publicId: string) {
  return getCloudinaryUrl(publicId, {
    f: "auto",
    q: "auto",
  });
}

function getThumbUrl(item: GalleryItem) {
  const srcId =
    item.mediaType === "VIDEO"
      ? (item.thumbnailPublicId ?? item.publicId)
      : item.publicId;
  return getImageUrl(srcId, 160, 160);
}

function getVideoUrl(publicId: string) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}

function getProjectPreview(project: PortfolioItem) {
  const coverAsset = getPreferredProjectAsset(project);

  if (coverAsset) {
    if (coverAsset.mediaType === "VIDEO") {
      return coverAsset.thumbnailPublicId
        ? getImageUrl(coverAsset.thumbnailPublicId, 1200, 900)
        : null;
    }

    return getImageUrl(coverAsset.publicId, 1200, 900);
  }

  if (project.mediaType === "VIDEO") {
    return project.thumbnailPublicId
      ? getImageUrl(project.thumbnailPublicId, 1200, 900)
      : null;
  }
  return getImageUrl(project.mediaPublicId, 1200, 900);
}

function getTabMeta(activeTab: PortfolioTab) {
  return TAB_CONFIG.find((tab) => tab.id === activeTab) ?? TAB_CONFIG[0];
}

function getGalleryItemLabel(item: GalleryItem, index: number) {
  return item.mediaType === "VIDEO"
    ? `Video ${index + 1}`
    : `Image ${index + 1}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectPage({
  activeTab,
  projects,
  counts,
  heroContent,
  tabContent,
}: ProjectPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTabMeta = getTabMeta(activeTab);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const heroBackgroundImage = heroContent.backgroundImagePublicId
    ? getCloudinaryUrl(heroContent.backgroundImagePublicId, {
        w: 2000,
        h: 1200,
        c: "fill",
        f: "auto",
        g: "auto",
        q: "auto",
      })
    : null;

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [visibleProjectCount, setVisibleProjectCount] =
    useState(PROJECTS_PER_PAGE);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);

  useEffect(() => {
    setSearchTerm("");
    setVisibleProjectCount(PROJECTS_PER_PAGE);
    setSelectedProjectId(null);
    setActiveAssetIndex(0);
    setImageZoom(1);
  }, [activeTab, projects]);

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
  const filteredProjects = projects.filter((project) => {
    if (!normalizedSearch) return true;
    return (
      project.title.toLowerCase().includes(normalizedSearch) ||
      project.description.toLowerCase().includes(normalizedSearch) ||
      project.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
    );
  });

  const visibleProjects = filteredProjects.slice(0, visibleProjectCount);
  const visibleResultsCount = Math.min(
    visibleProjectCount,
    filteredProjects.length,
  );
  const hasMoreProjects = visibleProjects.length < filteredProjects.length;

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ??
    null;

  const gallery = selectedProject ? getProjectGallery(selectedProject) : [];
  const safeAssetIndex = Math.min(
    activeAssetIndex,
    Math.max(0, gallery.length - 1),
  );
  const activeAsset = gallery[safeAssetIndex] ?? null;

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbStripRef.current) return;
    const active = thumbStripRef.current.children[safeAssetIndex] as
      | HTMLElement
      | undefined;
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeAssetIndex]);

  useEffect(() => {
    setVisibleProjectCount(PROJECTS_PER_PAGE);
  }, [normalizedSearch]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const stillExists = filteredProjects.some(
      (p) => p.id === selectedProjectId,
    );
    if (!stillExists) {
      setSelectedProjectId(null);
      setActiveAssetIndex(0);
      setImageZoom(1);
    }
  }, [filteredProjects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProjectId(null);
        setActiveAssetIndex(0);
        setImageZoom(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveAssetIndex((index) =>
          gallery.length <= 1
            ? index
            : index === 0
              ? gallery.length - 1
              : index - 1,
        );
        setImageZoom(1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveAssetIndex((index) =>
          gallery.length <= 1
            ? index
            : index === gallery.length - 1
              ? 0
              : index + 1,
        );
        setImageZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gallery.length, selectedProject]);

  const handleTabChange = (tab: PortfolioTab) => {
    if (tab === activeTab) return;
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  };

  const handleOpenProject = (projectId: string) => {
    const project =
      filteredProjects.find((item) => item.id === projectId) ?? null;
    setSelectedProjectId(projectId);
    setActiveAssetIndex(project ? getInitialGalleryIndex(project) : 0);
    setImageZoom(1);
  };

  const handleCloseProject = () => {
    setSelectedProjectId(null);
    setActiveAssetIndex(0);
    setImageZoom(1);
  };

  const goToAdjacentAsset = (direction: "prev" | "next") => {
    if (gallery.length <= 1) return;
    setActiveAssetIndex((i) => {
      if (direction === "prev") return i === 0 ? gallery.length - 1 : i - 1;
      return i === gallery.length - 1 ? 0 : i + 1;
    });
    setImageZoom(1);
  };

  const decreaseZoom = () =>
    setImageZoom((z) => Math.max(IMAGE_ZOOM_MIN, z - IMAGE_ZOOM_STEP));
  const increaseZoom = () =>
    setImageZoom((z) => Math.min(IMAGE_ZOOM_MAX, z + IMAGE_ZOOM_STEP));

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#09162f]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--dexta-secondary)] bg-[var(--dexta-secondary)]">
        {heroBackgroundImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroBackgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--dexta-secondary)_75%,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/15" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            {/* <div className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
              {heroContent.eyebrow}
            </div> */}
            <h1 className="max-w-5xl font-display text-4xl leading-none tracking-[-0.05em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {heroContent.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              {tabContent[activeTab].portfolioDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Portfolio grid ───────────────────────────────────────────────── */}
      <section className="relative py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tab switcher */}
          <div className="mb-8 grid gap-3 text-left sm:grid-cols-3 lg:mb-10">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "group rounded-2xl border px-5 py-4 text-left transition-all duration-300",
                    isActive
                      ? "border-[#00075d] bg-[#00075d] shadow-[0_28px_80px_-44px_rgba(0,7,93,0.28)]"
                      : "border-[#dbe8f4] bg-white hover:border-[#00abff]/25 hover:bg-[#fbfdff]",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "rounded-full border p-2.5",
                          isActive
                            ? "border-white/15 bg-white/10 text-white"
                            : cn(tab.accentSoft, tab.accent),
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-white" : "text-[#09162f]",
                          )}
                        >
                          {tab.label}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            isActive ? "text-white/68" : "text-[#6a7a93]",
                          )}
                        >
                          {tabContent[tab.id].portfolioEyebrow}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold",
                          isActive ? "text-white" : "text-[#09162f]",
                        )}
                      >
                        {counts[tab.id]}
                      </p>
                      <p
                        className={cn(
                          "text-[11px] uppercase tracking-[0.2em]",
                          isActive ? "text-white/55" : "text-[#7f8ea7]",
                        )}
                      >
                        Live
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section heading + search */}
          <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={cn("text-sm font-medium", activeTabMeta.accent)}>
                {activeTabMeta.label} archive
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#09162f] sm:text-4xl">
                Curated pieces from the {activeTabMeta.label.toLowerCase()} side
                of the studio.
              </h2>
              <p className="mt-3 text-sm text-[#55657f] sm:text-base">
                Showing {visibleResultsCount} of {filteredProjects.length}{" "}
                result
                {filteredProjects.length === 1 ? "" : "s"} from{" "}
                {counts[activeTab]} published{" "}
                {activeTabMeta.label.toLowerCase()} item
                {counts[activeTab] === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8aa0]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTabMeta.label.toLowerCase()} projects`}
                className="h-12 w-full rounded-full border border-[#dbe8f4] bg-white pl-11 pr-4 text-sm text-[#09162f] placeholder:text-[#7b8aa0] focus:border-[#00abff] focus:outline-none"
              />
            </div>
          </div>

          {/* Project cards */}
          {visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {visibleProjects.map((project, index) => {
                const previewSrc = getProjectPreview(project);
                const assetCount = project.assets.length;

                return (
                  <motion.button
                    key={project.id}
                    type="button"
                    onClick={() => handleOpenProject(project.id)}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="group h-full text-left"
                  >
                    <article className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#dbe8f4] bg-white transition-transform duration-300 hover:-translate-y-1">
                      <div
                        className={cn(
                          "relative overflow-hidden border-b border-[#e4eef7] bg-[#eef7ff]",
                          PROJECT_CARD_ASPECT,
                        )}
                      >
                        {previewSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewSrc}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#dfeefe]">
                            <span className="text-sm uppercase tracking-[0.3em] text-[#6f7f97]">
                              {project.mediaType}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-[#09162f]/42 transition-opacity duration-300 group-hover:bg-[#09162f]/56" />

                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="rounded-full border border-white/30 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#000c99] backdrop-blur-sm">
                            {project.serviceLabel}
                          </span>
                          {project.mediaType === "VIDEO" && (
                            <span className="rounded-full border border-white/30 bg-white/80 p-2 text-[#000c99] backdrop-blur-sm">
                              <Play className="h-3 w-3 fill-current" />
                            </span>
                          )}
                          {assetCount > 1 && (
                            <span className="rounded-full border border-white/30 bg-white/80 px-2 py-1 text-[10px] font-semibold text-[#000c99] backdrop-blur-sm">
                              {assetCount}
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <p className="text-xl font-semibold text-white">
                            {project.title}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                            View
                            <ArrowRight className="h-3.5 w-3.5" />
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="line-clamp-2 text-sm leading-6 text-[#55657f]">
                          {project.description ||
                            "No additional description provided."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.tags.length > 0 ? (
                            project.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[#dbe8f4] bg-[#f5fbff] px-3 py-1 text-xs text-[#4a5a74]"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-[#dbe8f4] bg-[#f5fbff] px-3 py-1 text-xs text-[#8a97ab]">
                              Untagged
                            </span>
                          )}
                        </div>
                        <div className="mt-auto pt-4">
                          <div className="flex items-center justify-between border-t border-[#e9f1f8] pt-4 text-xs text-[#6a7a93]">
                            <span>
                              {assetCount > 1
                                ? `${assetCount} media items`
                                : project.mediaType === "VIDEO"
                                  ? "Single video"
                                  : "Single image"}
                            </span>
                            {project.serviceType === "BUILD" &&
                            project.websiteUrl ? (
                              <span className="inline-flex items-center gap-1 font-medium text-[#000c99]">
                                Live link
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="font-medium text-[#000c99]">
                                Open project
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#dbe8f4] bg-white px-6 py-16 text-center">
              <p className="text-lg font-medium text-[#09162f]">
                No projects match your current search.
              </p>
              <p className="mt-2 text-sm text-[#6a7a93]">
                Try a different keyword or switch to another tab to explore more
                work.
              </p>
            </div>
          )}

          {hasMoreProjects && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-[#6a7a93]">
                More work is available below. Load the next 6 projects when
                you're ready.
              </p>
              <button
                type="button"
                onClick={() =>
                  setVisibleProjectCount((count) => count + PROJECTS_PER_PAGE)
                }
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#c7d9ee] bg-white px-6 text-sm font-medium text-[#000c99] transition-colors hover:border-[#00abff]/35 hover:bg-[#f7fbff]"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-[#dbe8f4] bg-[#eef7ff] py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6f7f97]">
              {heroContent.ctaSectionLabel}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#09162f] sm:text-4xl">
              {heroContent.ctaSectionHeadline}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#55657f] sm:text-base">
              {heroContent.ctaSectionBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={heroContent.ctaHref}>
              <Button className="h-12 rounded-full bg-[#000c99] px-7 text-white hover:bg-[#000a7a]">
                {heroContent.ctaText}
              </Button>
            </Link>
            <Link href={heroContent.cta2Href}>
              <Button
                variant="outline"
                className="h-12 rounded-full border-[#c7d9ee] bg-white px-7 text-[#000c99] hover:bg-[#f7fbff]"
              >
                {heroContent.cta2Text}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProject && activeAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#020611]/88 backdrop-blur-xl lg:overflow-hidden"
          >
            <div className="min-h-full p-2 sm:p-4 lg:flex lg:h-full lg:items-stretch lg:p-6">
              <div className="mx-auto flex min-h-[calc(100svh-1rem)] max-w-[1600px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#08101e] text-white shadow-[0_40px_140px_-60px_rgba(0,0,0,0.78)] sm:h-full sm:min-h-0 sm:rounded-[32px] lg:h-[calc(100vh-3rem)] lg:min-h-0 lg:w-full">
                {/* Header */}
                <div className="flex flex-shrink-0 flex-col items-start gap-3 border-b border-white/10 bg-[#0b1425] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/55">
                      <span>{selectedProject.serviceLabel}</span>
                      <span className="text-white/30">/</span>
                      <span>
                        {getGalleryItemLabel(activeAsset, safeAssetIndex)}
                      </span>
                      <span className="text-white/30">/</span>
                      <span>
                        {safeAssetIndex + 1} of {gallery.length}
                      </span>
                    </p>
                    <h3 className="mt-2 truncate text-lg font-semibold text-white sm:text-xl">
                      {selectedProject.title}
                    </h3>
                  </div>

                  <div className="flex w-full flex-shrink-0 items-center justify-end gap-2 sm:ml-3 sm:w-auto">
                    {activeAsset.mediaType === "IMAGE" && (
                      <>
                        <button
                          type="button"
                          onClick={decreaseZoom}
                          disabled={imageZoom <= IMAGE_ZOOM_MIN}
                          className="hidden rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-[#00abff]/40 hover:text-white disabled:opacity-30 sm:inline-flex"
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={increaseZoom}
                          disabled={imageZoom >= IMAGE_ZOOM_MAX}
                          className="hidden rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-[#00abff]/40 hover:text-white disabled:opacity-30 sm:inline-flex"
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageZoom(1)}
                          disabled={imageZoom === 1}
                          className="hidden rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-[#00abff]/40 hover:text-white disabled:opacity-30 sm:inline-flex"
                          aria-label="Reset zoom"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleCloseProject}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-[#00abff]/40 hover:text-white"
                      aria-label="Close preview"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Body: media + sidebar */}
                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_380px]">
                  {/* Media column */}
                  <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-b-0">
                    {/* Media frame — bounded, never overscales */}
                    <div className="relative flex min-h-[42svh] flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,171,255,0.14),transparent_32%),linear-gradient(180deg,#09101d_0%,#040915_100%)] sm:min-h-[48vh] lg:min-h-0">
                      <button
                        type="button"
                        onClick={() => goToAdjacentAsset("prev")}
                        disabled={gallery.length <= 1}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-[#071120]/88 p-2.5 text-white/75 backdrop-blur-sm transition-colors hover:border-[#00abff]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:left-4 sm:p-3"
                        aria-label="Previous media"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToAdjacentAsset("next")}
                        disabled={gallery.length <= 1}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-[#071120]/88 p-2.5 text-white/75 backdrop-blur-sm transition-colors hover:border-[#00abff]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:right-4 sm:p-3"
                        aria-label="Next media"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>

                      {/* The media itself */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${selectedProject.id}-${safeAssetIndex}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex h-full min-h-[42svh] w-full items-center justify-center sm:min-h-[46vh] lg:min-h-0"
                        >
                          {activeAsset.mediaType === "VIDEO" ? (
                            <div className="flex h-full w-full items-center justify-center p-3 sm:p-6 lg:p-8">
                              <video
                                key={activeAsset.publicId}
                                src={getVideoUrl(activeAsset.publicId)}
                                poster={
                                  activeAsset.thumbnailPublicId
                                    ? getImageUrl(
                                        activeAsset.thumbnailPublicId,
                                        1200,
                                        900,
                                      )
                                    : undefined
                                }
                                controls
                                autoPlay
                                playsInline
                                className="h-full max-h-full w-full rounded-[24px] border border-white/10 bg-[#020611] object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center overflow-hidden p-3 sm:p-6 lg:p-8">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                key={activeAsset.publicId}
                                src={getContainUrl(activeAsset.publicId)}
                                alt={
                                  activeAsset.caption ??
                                  `${selectedProject.title} — image ${safeAssetIndex + 1}`
                                }
                                className="max-h-full max-w-full rounded-[24px] border border-white/10 object-contain transition-transform duration-300"
                                style={{ transform: `scale(${imageZoom})` }}
                                onDoubleClick={() =>
                                  setImageZoom((z) => (z === 1 ? 1.75 : 1))
                                }
                              />
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Thumbnail strip — shown when project has multiple assets */}
                    {gallery.length > 1 && (
                      <div
                        ref={thumbStripRef}
                        className="flex gap-2 overflow-x-auto border-t border-white/10 bg-[#0b1425] p-2.5 sm:gap-3 sm:p-3"
                      >
                        {gallery.map((item, idx) => {
                          const thumbSrc = getThumbUrl(item);
                          const isActive = idx === safeAssetIndex;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveAssetIndex(idx);
                                setImageZoom(1);
                              }}
                              className={cn(
                                "group flex min-w-[140px] items-center gap-2.5 rounded-2xl border p-2 text-left transition-all sm:min-w-[180px] sm:gap-3 sm:p-2.5",
                                isActive
                                  ? "border-[#00abff]/55 bg-[#0e1a31] text-white"
                                  : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/20 hover:text-white",
                              )}
                              aria-label={`View ${getGalleryItemLabel(item, idx)}`}
                            >
                              <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#030814]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={thumbSrc}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                {item.mediaType === "VIDEO" && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                                  {getGalleryItemLabel(item, idx)}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm">
                                  {item.caption ||
                                    `View ${selectedProject.title} ${idx + 1}`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Details sidebar */}
                  <aside className="border-white/10 bg-[#0c1527] p-4 sm:p-7 lg:border-l">
                    <div className="space-y-5">
                      {/* Description */}
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                          About this project
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white/78">
                          {selectedProject.description ||
                            "No description was added for this project yet."}
                        </p>
                      </div>

                      {/* Caption (shown when active asset has one) */}
                      {activeAsset.caption && (
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                            Selected media note
                          </p>
                          <p className="mt-3 text-sm italic leading-6 text-white/70">
                            {activeAsset.caption}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                          Tags
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedProject.tags.length > 0 ? (
                            selectedProject.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/78"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/45">
                              Untagged
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                            Type
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {selectedProject.serviceLabel}
                          </p>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {gallery.length > 1 ? "Gallery" : "Format"}
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {gallery.length > 1
                              ? `${gallery.length} assets`
                              : activeAsset.mediaType === "VIDEO"
                                ? "Video"
                                : "Image"}
                          </p>
                        </div>
                      </div>

                      {gallery.length > 1 && (
                        <div className="hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-5 lg:block">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                            Project media
                          </p>
                          <div className="mt-3 space-y-2">
                            {gallery.map((item, idx) => {
                              const isActive = idx === safeAssetIndex;

                              return (
                                <button
                                  key={`${item.id}-sidebar`}
                                  type="button"
                                  onClick={() => {
                                    setActiveAssetIndex(idx);
                                    setImageZoom(1);
                                  }}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                                    isActive
                                      ? "border-[#00abff]/55 bg-[#0e1a31] text-white"
                                      : "border-white/10 bg-[#0a1221] text-white/72 hover:border-white/20 hover:text-white",
                                  )}
                                >
                                  <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#030814]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getThumbUrl(item)}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                    {item.mediaType === "VIDEO" && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                        <Play className="h-3.5 w-3.5 fill-white text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                                      {getGalleryItemLabel(item, idx)}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm">
                                      {item.caption ||
                                        `Select ${getGalleryItemLabel(item, idx).toLowerCase()}`}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Visit Website — BUILD projects only */}
                      {selectedProject.serviceType === "BUILD" &&
                        selectedProject.websiteUrl && (
                          <a
                            href={selectedProject.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#000c99] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#000a7a]"
                          >
                            Visit Website
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}

                      {/* Navigation hint */}
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                          Navigation
                        </p>
                        <p className="mt-3 text-xs leading-6 text-white/62">
                          Use the left and right arrows to move through this
                          project's images and videos.
                          {gallery.length > 1 &&
                            " Select any media tile to switch between images and videos in this project."}
                          {activeAsset.mediaType === "IMAGE" &&
                            " Double-click to toggle zoom."}
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
