"use client";

import { AlertTriangle, Loader, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { Button } from "@/components/ui/button";

interface GalleryProject {
  image: string;
  id: number | string;
  name: string;
  description: string;
  category: string;
}

interface ProjectGalleryProps {
  projects: GalleryProject[];
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const isLoading = false;
  const isError = false;
  const error = null as Error | null;

  // Convert projects to CardStackItem format
  const cardItems: CardStackItem[] =
    projects?.map((project) => ({
      id: project.id,
      title: project.name,
      description: project.description,
      tag: project.category,
      href: "#",
      ctaLabel: "View Details",
      imageSrc: getProjectImage(project.id),
    })) || [];

  // Helper function to get project images (using Unsplash stock)
  function getProjectImage(id: string | number): string {
    const images = [
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    ];

    // Use project id to get a consistent image
    const index =
      typeof id === "string"
        ? id.charCodeAt(0) % images.length
        : id % images.length;

    return images[index];
  }

  // Custom render function for CardStack
  const renderProjectCard = (
    item: CardStackItem,
    _state: { active: boolean },
  ) => {
    return (
      <div className="relative h-full w-full">
        {/* Image */}
        <div className="absolute inset-0">
          {item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.title}
              fill
              className="object-cover"
              draggable={false}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
              <div className="text-4xl font-bold text-white/50">
                {item.title.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 lg:p-6">
          <div className="mb-2">
            <span className="inline-block rounded-full bg-cyan-500/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              {item.tag || "Project"}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-2 line-clamp-2 text-sm sm:text-base text-white/80">
              {item.description}
            </p>
          )}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm font-medium text-cyan-300">
            <span>View Project</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20 text-cyan-400">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="ml-4 text-lg font-mono">Loading Projects...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center py-20 text-red-500">
          <AlertTriangle className="h-8 w-8" />
          <p className="ml-4 text-lg font-mono">
            Error: {error?.message || "Failed to load projects"}
          </p>
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 lg:py-20 text-gray-400">
          <AlertTriangle className="h-12 w-12" />
          <p className="text-lg font-mono">No projects found</p>
          <p className="mt-2 text-sm">Start by creating your first project</p>
        </div>
      );
    }

    return (
      <motion.div
        className="w-full flex justify-center mt-2 sm:mt-8 md:mt-12 lg:mt-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full" style={{ perspective: "1000px" }}>
            <CardStack
              items={cardItems}
              initialIndex={0}
              maxVisible={3}
              cardWidth={300}
              cardHeight={200}
              cardWidthMd={380}
              cardHeightMd={240}
              cardWidthLg={520}
              cardHeightLg={380}
              maxVisibleMd={5}
              maxVisibleLg={5}
              overlap={0.48}
              spreadDeg={24}
              spreadDegMd={36}
              spreadDegLg={42}
              perspectivePx={1200}
              depthPx={120}
              tiltXDeg={8}
              activeLiftPx={25}
              activeScale={1.05}
              inactiveScale={0.92}
              springStiffness={300}
              springDamping={25}
              loop={true}
              autoAdvance={true}
              intervalMs={3500}
              pauseOnHover={true}
              showDots={true}
              renderCard={renderProjectCard}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-text tracking-tight">
            Our Recent Work
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-400 px-4 sm:px-0">
            Proof we're not just talking
          </p>
        </div>
      </div>

      <div className="w-full mt-[-1.5rem] sm:mt-[-1.5rem] lg:mt-[-2rem] lg:mb-16 text-center ">
        {renderContent()}
      </div>

      <div className="flex justify-center mt-8 sm:mt-12">
        <Link href="/projects">
          <Button className="h-12 md:h-14 px-6 sm:px-8 rounded-none bg-primary hover:bg-primary/70 text-primary-text font-mono tracking-widest backdrop-blur-sm transition-all duration-300 group text-sm sm:text-base">
            VIEW ALL PROJECTS
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
