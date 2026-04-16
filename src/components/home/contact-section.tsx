"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ContactPageContentData,
  ContactSocialLinkData,
} from "@/lib/contact-defaults";
import { CONTACT_SOCIAL_PLATFORM_META } from "@/lib/contact-socials";

const ease = [0.16, 1, 0.3, 1] as const;

function toPhoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export function ContactSection({
  content,
  socialLinks,
}: {
  content: ContactPageContentData;
  socialLinks: ContactSocialLinkData[];
}) {
  const headingWords = content.homeTitle.split(/\s+/).filter(Boolean);
  const contactRows = [
    {
      icon: MapPin,
      label: content.addressLabel,
      values: [{ value: content.address, href: null }],
    },
    {
      icon: Mail,
      label: content.emailLabel,
      values: content.emails.map((email) => ({
        value: email,
        href: `mailto:${email}`,
      })),
    },
    {
      icon: Phone,
      label: content.phoneLabel,
      values: content.phones.map((phone) => ({
        value: phone,
        href: toPhoneHref(phone),
      })),
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Card entrance */}
        <motion.div
          className="relative overflow-hidden rounded-[10px] bg-[var(--dexta-secondary)] px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16"
          initial={{ opacity: 0, y: 56, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease }}
        >
          {/* Subtle inner glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--dexta-primary)_40%,transparent)] blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* ── Left: CTA text ── */}
            <div>
              {/* Eyebrow */}
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.26em] text-white/60"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              >
                {content.homeEyebrow}
              </motion.p>

              {/* Heading — word-by-word slide-up */}
              <h2 className="mt-4 flex flex-wrap gap-x-[0.28em] font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
                {headingWords.map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    className="overflow-hidden inline-block"
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ y: "110%", opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.55,
                        delay: 0.35 + i * 0.1,
                        ease,
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h2>

              {/* Body */}
              <motion.p
                className="mt-5 max-w-sm text-base leading-8 text-white/75"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.6, ease: "easeOut" }}
              >
                {content.homeBody}
              </motion.p>

              {/* CTA button */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.72, ease: "easeOut" }}
              >
                <Link href={content.homeCtaHref}>
                  <Button className="h-12 rounded-full bg-[var(--dexta)] px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    {content.homeCtaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* ── Right: contact rows + socials ── */}
            <div className="space-y-5">
              {contactRows.map(({ icon: Icon, label, values }, i) => (
                <motion.div
                  key={label}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: 0.3 + i * 0.11,
                    ease: "easeOut",
                  }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4 text-[var(--dexta)]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                      {label}
                    </p>
                    <div className="mt-1 space-y-1.5">
                      {values.map((item) =>
                        item.href ? (
                          <a
                            key={`${label}-${item.value}`}
                            href={item.href}
                            className="block text-sm leading-6 text-white/80 transition-colors hover:text-white"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p
                            key={`${label}-${item.value}`}
                            className="text-sm leading-6 text-white/80"
                          >
                            {item.value}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Socials */}
              {socialLinks.length ? (
                <motion.div
                  className="border-t border-white/10 pt-5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    {content.socialsLabel}
                  </p>
                  <div className="flex gap-3">
                    {socialLinks.map((social, i) => {
                      const Icon =
                        CONTACT_SOCIAL_PLATFORM_META[social.platform].icon;

                      return (
                        <motion.a
                          key={`${social.platform}-${social.href}`}
                          href={social.href}
                          title={social.label}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 transition-all hover:border-[var(--dexta)] hover:bg-[color-mix(in_srgb,var(--dexta)_10%,transparent)] hover:text-white"
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                            delay: 0.65 + i * 0.09,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.a>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
