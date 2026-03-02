"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { ContactForm as ContactFormComponent } from "@/components/home/contact-form";

const contactInfo = {
  address: "96 Elioparanwo Road, Port Harcourt, Rivers State, Nigeria",
  emails: ["info@dexta.services", "admin@dexta.services"],
  phone: "+234 810 320 8287",
};

export function ContactHero() {
  return (
    <section className="relative min-h-[55vh] sm:min-h-[60vh] lg:min-h-[70vh] bg-white text-[#212529] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[color:var(--color-primary)]/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[color:var(--color-secondary-foreground)]/10 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[color:var(--color-secondary-foreground)]/20 bg-white/80 backdrop-blur-md mb-6 text-[color:var(--color-secondary-foreground)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-primary)] opacity-30"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--color-secondary-foreground)]"></span>
            </span>
            <span className="text-xs font-mono tracking-wider">
              CONTACT US
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Get In{" "}
            <span className="text-[color:var(--color-secondary-foreground)]">
              Touch
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Have a project in mind? Let's bring your vision to life.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ContactInfo() {
  return (
    <section className="bg-white text-[#212529] py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">Where to Find Us</h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-gray-600 text-sm">{contactInfo.address}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <div className="space-y-1">
                    {contactInfo.emails.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="text-gray-600 text-sm hover:text-cyan-600 transition-colors flex items-center gap-1"
                      >
                        {email}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                    className="text-gray-600 text-sm hover:text-cyan-600 transition-colors flex items-center gap-1"
                  >
                    {contactInfo.phone}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pt-14"
          >
            <ContactFormComponent />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
