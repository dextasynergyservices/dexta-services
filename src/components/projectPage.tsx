"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Layout, Palette, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Sample project data - you can replace with your actual data
const projectsData = {
  design: [
    {
      id: 1,
      title: "Brand Identity Suite",
      description: "Complete brand identity including logo, color palette, and brand guidelines for a tech startup.",
      category: "Branding",
      tags: ["Logo Design", "Brand Guidelines", "Visual Identity"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/design/brand-identity"
    },
    {
      id: 2,
      title: "UI/UX Dashboard",
      description: "Modern dashboard interface for a SaaS platform with intuitive user experience.",
      category: "UI/UX",
      tags: ["Figma", "Prototyping", "User Research"],
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/design/dashboard-ui"
    },
    {
      id: 3,
      title: "Mobile App Design",
      description: "Fitness tracking app with engaging animations and personalized user journeys.",
      category: "Mobile Design",
      tags: ["iOS", "Android", "Prototype"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/design/mobile-app"
    },
    {
      id: 4,
      title: "Packaging Design",
      description: "Sustainable packaging solutions for an organic skincare line.",
      category: "Packaging",
      tags: ["3D Mockup", "Sustainable", "Print Ready"],
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/design/packaging"
    }
  ],
  prints: [
    {
      id: 5,
      title: "Annual Report",
      description: "Corporate annual report with data visualization and premium print finish.",
      category: "Corporate",
      tags: ["Annual Report", "Data Viz", "Premium Print"],
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/prints/annual-report"
    },
    {
      id: 6,
      title: "Product Catalog",
      description: "200-page product catalog with high-quality photography and spot UV coating.",
      category: "Catalog",
      tags: ["Product Photography", "Layout", "Print Production"],
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/prints/catalog"
    },
    {
      id: 7,
      title: "Exhibition Stand",
      description: "Large format printing for trade show exhibition with modular design.",
      category: "Large Format",
      tags: ["Exhibition", "Banner", "Modular"],
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/prints/exhibition"
    },
    {
      id: 8,
      title: "Marketing Brochures",
      description: "Series of marketing brochures with die-cut elements and special finishes.",
      category: "Marketing",
      tags: ["Brochure", "Die-cut", "Spot Gloss"],
      image: "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/prints/brochures"
    }
  ],
  websites: [
    {
      id: 9,
      title: "E-commerce Platform",
      description: "Full-featured e-commerce website with custom CMS and payment integration.",
      category: "E-commerce",
      tags: ["Next.js", "Stripe", "Headless CMS"],
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/websites/ecommerce"
    },
    {
      id: 10,
      title: "Corporate Portal",
      description: "Enterprise portal with role-based access and real-time analytics dashboard.",
      category: "Enterprise",
      tags: ["React", "TypeScript", "GraphQL"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/websites/portal"
    },
    {
      id: 11,
      title: "Portfolio Website",
      description: "Artist portfolio with interactive gallery and video background features.",
      category: "Portfolio",
      tags: ["WebGL", "Animation", "Responsive"],
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/websites/portfolio"
    },
    {
      id: 12,
      title: "Booking System",
      description: "Appointment booking platform with calendar integration and notifications.",
      category: "Web App",
      tags: ["Full-stack", "Real-time", "Mobile First"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      link: "/projects/websites/booking"
    }
  ]
};

const tabs = [
  { id: "design", label: "Design", icon: Palette, count: projectsData.design.length },
  { id: "prints", label: "Prints", icon: Printer, count: projectsData.prints.length },
  { id: "websites", label: "Websites", icon: Layout, count: projectsData.websites.length },
];

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState("design");

  const activeProjects = projectsData[activeTab as keyof typeof projectsData];

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
              Explore our diverse range of projects across design, print, and web development. 
              Each piece represents our commitment to innovation, quality, and client satisfaction.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-black/20">
                    {tab.count}
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
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-primary-text"
            >
              {activeTab === "design" && "Design Projects"}
              {activeTab === "prints" && "Print Projects"}
              {activeTab === "websites" && "Website Projects"}
            </motion.h2>
            <p className="mt-4 text-gray-400">
              {activeTab === "design" && "Visual identities, UI/UX designs, and creative solutions"}
              {activeTab === "prints" && "Printed materials, large format, and production work"}
              {activeTab === "websites" && "Web applications, platforms, and digital experiences"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      {project.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary-text group-hover:text-cyan-400 transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="mt-2 text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-800/50 px-3 py-1 text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link href={project.link}>
                    <Button
                      variant="ghost"
                      className="mt-6 w-full group/btn"
                    >
                      View Project Details
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-gray-300">
            Let's collaborate to create something amazing together. Get in touch to discuss your ideas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="h-12 px-8 bg-cyan-500 hover:bg-cyan-600 text-white">
                Start a Project
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="h-12 px-8 border-gray-600 text-white hover:bg-white/10">
                Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}