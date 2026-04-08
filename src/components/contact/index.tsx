"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import { ContactFormEmbed } from "@/components/home/contact-form";
import type {
  ContactPageContentData,
  ContactSocialLinkData,
} from "@/lib/contact-defaults";
import { CONTACT_SOCIAL_PLATFORM_META } from "@/lib/contact-socials";

function toPhoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export function ContactHero({ content }: { content: ContactPageContentData }) {
  return (
    <section className="relative overflow-hidden bg-[var(--dexta-secondary)] text-white">
      {/* Subtle radial glow */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[var(--dexta-primary)]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--dexta)]/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="inline-flex rounded-full border border-white bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--dexta-secondary)]">
            {content.heroEyebrow}
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.92] tracking-[-0.05em]">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
            {content.heroBody}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ContactInfo({
  content,
  socialLinks,
}: {
  content: ContactPageContentData;
  socialLinks: ContactSocialLinkData[];
}) {
  return (
    <section className="bg-[var(--background)] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:gap-16 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* ── Left: contact details ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--dexta)]">
              {content.infoEyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--dexta-secondary)] sm:text-5xl">
              {content.infoTitle}
            </h2>
            <p className="mt-5 max-w-sm text-base leading-8 text-[var(--dexta-secondary)]">
              {content.infoBody}
            </p>

            <div className="mt-8 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-4 rounded-[24px] border border-[var(--dexta-primary)] bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--dexta-primary)] text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dexta)]">
                    {content.addressLabel}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--dexta-secondary)]">
                    {content.address}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 rounded-[24px] border border-[var(--dexta-primary)] bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--dexta-primary)] text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dexta)]">
                    {content.emailLabel}
                  </p>
                  <div className="mt-2 space-y-1">
                    {content.emails.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="block text-sm leading-7 text-[var(--dexta-secondary)] underline-offset-2 hover:underline hover:text-[var(--dexta-primary)] transition-colors"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 rounded-[24px] border border-[var(--dexta-primary)] bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--dexta-primary)] text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dexta)]">
                    {content.phoneLabel}
                  </p>
                  <div className="mt-2 space-y-1">
                    {content.phones.map((phone) => (
                      <a
                        key={phone}
                        href={toPhoneHref(phone)}
                        className="block text-sm leading-7 text-[var(--dexta-secondary)] underline-offset-2 transition-colors hover:text-[var(--dexta-primary)] hover:underline"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Socials */}
              {socialLinks.length ? (
                <div className="rounded-[24px] border border-[var(--dexta-primary)] bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--dexta)]">
                    {content.socialsLabel}
                  </p>
                  <div className="mt-3 flex gap-3">
                    {socialLinks.map((social) => {
                      const Icon =
                        CONTACT_SOCIAL_PLATFORM_META[social.platform].icon;

                      return (
                        <a
                          key={`${social.platform}-${social.href}`}
                          href={social.href}
                          title={social.label}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--dexta-primary)] text-[var(--dexta-secondary)] transition-all hover:bg-[var(--dexta-primary)] hover:text-white"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* ── Right: form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--dexta)]">
              {content.formEyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--dexta-secondary)] sm:text-5xl">
              {content.formTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--dexta-secondary)]">
              {content.formBody}
            </p>
            <div className="mt-8">
              <ContactFormEmbed />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
