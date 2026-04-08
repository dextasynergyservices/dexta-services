"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import Image from "next/image";
import type {
  ContactPageContentData,
  ContactSocialLinkData,
} from "@/lib/contact-defaults";
import { CONTACT_SOCIAL_PLATFORM_META } from "@/lib/contact-socials";

export function Footer({
  contact,
  socialLinks,
}: {
  contact: ContactPageContentData;
  socialLinks: ContactSocialLinkData[];
}) {
  const currentYear = new Date().getFullYear();
  const primaryEmail = contact.emails[0] ?? "";
  const primaryPhone = contact.phones[0] ?? "";

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

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Services", href: "#services" },
        { label: "Portfolio", href: "#portfolio" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
      ],
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden bg-primary-background">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#000c99]/15 blur-3xl" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#00075d]/10 blur-3xl" />
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
          <motion.div
            variants={itemVariants}
            className="col-span-2 sm:col-span-1 space-y-4"
          >
            <div className="inline-block">
              <Image
                src="/images/dexta1.png"
                alt="DEXTA"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-400">
                Engineered digital ecosystems for the future.
              </p>
              {primaryEmail ? (
                <a
                  href={`mailto:${primaryEmail}`}
                  className="mt-4 block text-sm text-gray-300 transition-colors hover:text-white"
                >
                  {primaryEmail}
                </a>
              ) : null}
              {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone.replace(/[^\d+]/g, "")}`}
                  className="mt-1 block text-sm text-gray-300 transition-colors hover:text-white"
                >
                  {primaryPhone}
                </a>
              ) : null}
            </div>
            {socialLinks.length ? (
              <div className="flex gap-4 pt-4">
                {socialLinks.map((social) => {
                  const Icon =
                    CONTACT_SOCIAL_PLATFORM_META[social.platform].icon;

                  return (
                    <motion.a
                      key={`${social.platform}-${social.href}`}
                      href={social.href}
                      className="group relative rounded-full border border-[var(--primary)] bg-[var(--primary)]/10 p-3 transition-all duration-300 hover:border-[#000c99] hover:bg-[#000c99]/20"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={social.label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon className="h-5 w-5 text-[var(--primary)] transition-colors duration-300 group-hover:text-[var(--dexta)]" />
                    </motion.a>
                  );
                })}
              </div>
            ) : null}
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
                      className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-300 hover:text-[var(--primary)]"
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
        <div className="my-12 border-t border-[#000c99]/20" />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col gap-3 md:items-center md:justify-between"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} DEXTA Services. All rights reserved.
          </p>
        </motion.div>
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
