"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Layout, Palette, Printer, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Project type definition
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  gallery: string[];
  link: string;
  websiteUrl?: string;
}

// Sample project data - you can replace with your actual data
const projectsData = {
  design: [
    {
      id: 1,
      title: "Brand Identity Suite",
      description:
        "Complete brand identity including logo, color palette, and brand guidelines for a tech startup.",
      category: "Branding",
      tags: ["Logo Design", "Brand Guidelines", "Visual Identity"],
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/design/brand-identity",
    },
    {
      id: 2,
      title: "UI/UX Dashboard",
      description:
        "Modern dashboard interface for a SaaS platform with intuitive user experience.",
      category: "UI/UX",
      tags: ["Figma", "Prototyping", "User Research"],
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/design/dashboard-ui",
    },
    {
      id: 3,
      title: "Mobile App Design",
      description:
        "Fitness tracking app with engaging animations and personalized user journeys.",
      category: "Mobile Design",
      tags: ["iOS", "Android", "Prototype"],
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512941691920-25bda36dc643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/design/mobile-app",
    },
    {
      id: 4,
      title: "Packaging Design",
      description:
        "Sustainable packaging solutions for an organic skincare line.",
      category: "Packaging",
      tags: ["3D Mockup", "Sustainable", "Print Ready"],
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/design/packaging",
    },
  ],
  prints: [
    {
      id: 5,
      title: "Annual Report",
      description:
        "Corporate annual report with data visualization and premium print finish.",
      category: "Corporate",
      tags: ["Annual Report", "Data Viz", "Premium Print"],
      image:
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/prints/annual-report",
    },
    {
      id: 6,
      title: "Product Catalog",
      description:
        "200-page product catalog with high-quality photography and spot UV coating.",
      category: "Catalog",
      tags: ["Product Photography", "Layout", "Print Production"],
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/prints/catalog",
    },
    {
      id: 7,
      title: "Exhibition Stand",
      description:
        "Large format printing for trade show exhibition with modular design.",
      category: "Large Format",
      tags: ["Exhibition", "Banner", "Modular"],
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1550259987-2fd896e26121?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/prints/exhibition",
    },
    {
      id: 8,
      title: "Marketing Brochures",
      description:
        "Series of marketing brochures with die-cut elements and special finishes.",
      category: "Marketing",
      tags: ["Brochure", "Die-cut", "Spot Gloss"],
      image:
        "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/prints/brochures",
    },
  ],
  websites: [
    {
      id: 9,
      title: "E-commerce Platform",
      description:
        "Full-featured e-commerce website with custom CMS and payment integration.",
      category: "E-commerce",
      tags: ["Next.js", "Stripe", "Headless CMS"],
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/websites/ecommerce",
      websiteUrl: "https://example-ecommerce.com",
    },
    {
      id: 10,
      title: "Corporate Portal",
      description:
        "Enterprise portal with role-based access and real-time analytics dashboard.",
      category: "Enterprise",
      tags: ["React", "TypeScript", "GraphQL"],
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/websites/portal",
      websiteUrl: "https://example-portal.com",
    },
    {
      id: 11,
      title: "Portfolio Website",
      description:
        "Artist portfolio with interactive gallery and video background features.",
      category: "Portfolio",
      tags: ["WebGL", "Animation", "Responsive"],
      image:
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1563062810-1cff505c3e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/websites/portfolio",
      websiteUrl: "https://example-portfolio.com",
    },
    {
      id: 12,
      title: "Booking System",
      description:
        "Appointment booking platform with calendar integration and notifications.",
      category: "Web App",
      tags: ["Full-stack", "Real-time", "Mobile First"],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      ],
      link: "/projects/websites/booking",
      websiteUrl: "https://example-booking.com",
    },
  ],
};

const tabs = [
  {
    id: "design",
    label: "Design",
    icon: Palette,
    count: projectsData.design.length,
  },
  {
    id: "build",
    label: "Build",
    icon: Layout,
    count: projectsData.websites.length,
  },
  {
    id: "print",
    label: "Print",
    icon: Printer,
    count: projectsData.prints.length,
  },
];

const PROJECTS_PER_PAGE = 6;

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "design";
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setActiveTab(tabParam);
    setCurrentPage(1);
  }, [tabParam]);

  const getProjectsForTab = (tab: string) => {
    if (tab === "build") return projectsData.websites;
    if (tab === "print") return projectsData.prints;
    return projectsData.design;
  };

  const activeProjects = getProjectsForTab(activeTab);

  // const categories = Array.from(
  //   new Set(activeProjects.map((p) => p.category))
  // );

  const filteredProjects = activeProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = !selectedCategory || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + PROJECTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-950 via-gray-900 to-purple-950 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/5 bg-grid-16" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Projects | Our Work
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our diverse range of projects across design, print, and
              web development. Each piece represents our commitment to
              innovation, quality, and client satisfaction.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm("");
                    setSelectedCategory(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-black/20">
                    {getProjectsForTab(tab.id).length}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-text" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-gray-700 rounded-lg primary-text focus:outline-none placeholder-primary-text/50"
              />
            </div>

            {/* Category Filter */}
            {/* <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  !selectedCategory
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div> */}
          </div>

          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-primary-text mb-2"
            >
              {activeTab === "design" && "Design Projects"}
              {activeTab === "build" && "Build Projects"}
              {activeTab === "print" && "Print Projects"}
            </motion.h2>
            <p className="text-gray-400">
              Showing {filteredProjects.length} of {activeProjects.length} projects
            </p>
            <p className="mt-2 text-gray-400">
              {activeTab === "design" &&
                "Visual identities, UI/UX designs, and creative solutions"}
              {activeTab === "build" &&
                "Web applications, platforms, and digital experiences"}
              {activeTab === "print" &&
                "Printed materials, large format, and production work"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 overflow-x-hidden">
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border"
              >
                <div 
                  className="aspect-[16/9] overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentImageIndex(0);
                  }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-3 sm:p-4">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      {project.category}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-primary-text group-hover:text-cyan-400 transition-colors duration-300 mb-2">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-800/50 px-2 sm:px-3 py-1 text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link href={project.link}>
                    <Button variant="ghost" className="mt-6 w-full group/btn">
                      View Project Details
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">
                  No projects found matching your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    page === currentPage
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-gray-300">
            Let's collaborate to create something amazing together. Get in touch
            to discuss your ideas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="h-12 px-8 bg-cyan-500 hover:bg-cyan-600 text-white">
                Start a Project
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="h-12 px-8 border-gray-600 text-white hover:bg-white/10"
              >
                Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full max-h-screen overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Gallery */}
            <div className="relative w-full bg-black rounded-lg overflow-hidden mb-6">
              <div className="relative aspect-square sm:aspect-video">
                <Image
                  src={selectedProject.gallery[currentImageIndex]}
                  alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Navigation Buttons */}
              {selectedProject.gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) =>
                        i === 0 ? selectedProject.gallery.length - 1 : i - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((i) =>
                        i === selectedProject.gallery.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {selectedProject.gallery.length}
              </div>
            </div>

            {/* Thumbnail Grid */}
            {selectedProject.gallery.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                {selectedProject.gallery.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      idx === currentImageIndex
                        ? "border-cyan-500"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Project Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-text mb-3">
                {selectedProject.title}
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mb-4 leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedProject.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-800/50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {selectedProject.websiteUrl && (
                  <a
                    href={selectedProject.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold text-center transition-colors"
                  >
                    Visit Website
                  </a>
                )}
                <Link href={selectedProject.link} className="flex-1">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
