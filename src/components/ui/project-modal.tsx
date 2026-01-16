"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { CardStackItem } from "./card-stack";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CardStackItem | null;
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const keyEvent = e as any;
      if (keyEvent.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <div className="relative w-full h-full lg:w-[90%] lg:h-[90%] max-h-[90vh] overflow-hidden rounded-3xl bg-card-foreground shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Content */}
              <div className="overflow-y-auto max-h-[90vh] flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="relative w-full lg:w-1/2 h-64 lg:h-auto min-h-[400px]">
                  {project.imageSrc ? (
                    <Image
                      src={project.imageSrc}
                      alt={project.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                      No image available
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:bg-gradient-to-r" />

                  {/* Category badge */}
                  {project.tag && (
                    <div className="absolute bottom-6 left-6 lg:bottom-auto lg:top-6 px-4 py-2 bg-cyan-500/90 backdrop-blur rounded-full text-white text-sm font-semibold">
                      {project.tag}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6"
                  >
                    {project.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg lg:text-xl xl:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl"
                  >
                    {project.description || "A showcase of our work and expertise."}
                  </motion.p>

                  {/* Details Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8"
                  >
                    {project.tag && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                          Category
                        </p>
                        <p className="text-lg text-white font-medium">{project.tag}</p>
                      </div>
                    )}
                    {project.ctaLabel && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                          Type
                        </p>
                        <p className="text-lg text-white font-medium">{project.ctaLabel}</p>
                      </div>
                    )}
                  </motion.div>

                  {/* CTA Button */}
                  {project.href && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-3 lg:px-10 lg:py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold lg:text-lg rounded-full transition-colors"
                      >
                        View Project
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
