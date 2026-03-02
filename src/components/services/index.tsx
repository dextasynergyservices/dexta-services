"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Brush, Code, Printer, ArrowRight, Building2, GraduationCap, Church } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "design",
    title: "Design",
    icon: <Brush className="w-8 h-8" />,
    description: "Design-as-a-service – Graphics, Video, Web Marketing Design – For Web, For Print",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
  {
    id: "build",
    title: "Build",
    icon: <Code className="w-8 h-8" />,
    description: "Web & Software Development – Websites, Web Applications, Mobile Applications. Business Communication Solutions – Professional Email Services, Chatbot, SMS. Digital Marketing – Ads buying, Email Marketing, Social Media marketing, SEO, Content Marketing, Funnel, Lead Generation.",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
  {
    id: "print",
    title: "Print",
    icon: <Printer className="w-8 h-8" />,
    description: "Paper Print – Flyers, brochures, cards etc. Apparel Print - Clothes, Bags etc.",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
];

const audiences = [
  {
    id: "business",
    title: "For Businesses",
    description: "Digital solutions tailored for your business growth",
    icon: <Building2 className="w-8 h-8" />,
    href: "/offers/business",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
  {
    id: "schools",
    title: "For Schools",
    description: "Educational digital transformation packages",
    icon: <GraduationCap className="w-8 h-8" />,
    href: "/offers/schools",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
  {
    id: "churches",
    title: "For Churches & Organizations",
    description: "Ministry and organization digital solutions",
    icon: <Church className="w-8 h-8" />,
    href: "/offers/churches",
    color: "text-[color:var(--color-secondary-foreground)]",
  },
];

export function ServicesHero() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh] text-white overflow-hidden">
      {/* Background image */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ scale: 1.06, x: 0, y: 0 }}
        animate={{ scale: 1.14, x: 16, y: -10 }}
        transition={{
          duration: 14,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        <Image
          src="/images/services.png"
          alt="Montage of design, code, and print services"
          fill
          priority
          className="object-contain"
        />
      </motion.div>

      {/* Blue overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-cyan-950/55 to-black/40" />
      <div className="absolute inset-0 bg-blue-500/10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
            What We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-200">
              Do
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
            We deliver world class value so that you can Be more. Do more. Have more.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ServicesGrid() {
  return (
    <section className="bg-white text-[#212529] py-16 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="relative p-8 rounded-2xl border border-[color:var(--color-border)] bg-white transition-all duration-300 hover:shadow-lg"
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className={`w-16 h-16 rounded-xl bg-white border border-[color:var(--color-border)] flex items-center justify-center mb-6 ${service.color}`}>
                {service.icon}
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold mb-4">{service.title}</h3>
              
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <section className="bg-white text-[#212529] py-16 sm:py-20 lg:py-28 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            For Who?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored digital solutions for different sectors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={audience.href}>
                <div className="group relative p-6 rounded-2xl border border-[color:var(--color-border)] bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full">
                  <div className={`w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-4 ${audience.color}`}>
                    {audience.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{audience.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{audience.description}</p>

                  <div className={`flex items-center gap-2 text-sm font-medium ${audience.color} group-hover:gap-3 transition-all`}>
                    <span>View Offers</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
