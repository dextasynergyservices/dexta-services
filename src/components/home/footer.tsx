"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const socialLinks = [
    { icon: Github, label: "GitHub", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Mail, label: "Email", href: "mailto:contact@dexta.dev" },
  ];

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Services", href: "#services" },
        { label: "Portfolio", href: "#portfolio" },
        { label: "Pricing", href: "#pricing" },
        { label: "Docs", href: "#docs" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
        { label: "Cookie Policy", href: "#cookies" },
      ],
    },
  ];

  return (
    <footer className="relative w-screen overflow-hidden bg-primary-background">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 z-30 relative">
        <motion.div
          className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-4 lg:gap-16"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1 space-y-4">
            <div className="inline-block">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                DEXTA
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-400">
                Engineered digital ecosystems for the future.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  className="group relative p-3 rounded-full border border-cyan-500/50 bg-cyan-500/10 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={label}
                >
                  <Icon className="h-5 w-5 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((column, idx) => (
            <motion.div key={idx} variants={itemVariants} className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-cyan-400"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="my-12 border-t border-cyan-500/20" />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col gap-3 md:items-center md:justify-between"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          
          
          {/* Hover text effect */}
          <div className="flex h-[6rem] sm:h-[8rem] md:h-[10rem] lg:h-[12rem] w-full items-center justify-center">
            <TextHoverEffect text="DEXTA" className="w-48 sm:w-56 md:w-72 lg:w-80 xl:w-96" />
          </div>

          <p className="text-sm text-gray-400 text-center">
            © {currentYear} DEXTA Services. All rights reserved.
          </p>
          
          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* <Link
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-3 text-sm font-medium text-cyan-300 transition-all duration-300 hover:border-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 hover:text-cyan-200"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link> */}
          </motion.div>
        </motion.div>
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
