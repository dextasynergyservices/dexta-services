"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import {
  Target,
  Lightbulb,
  Globe,
  TrendingUp,
  Sparkles,
  Zap,
  HeartHandshake,
  Shield,
} from "lucide-react";

const expertiseAreas = [
  {
    icon: Zap,
    title: "Digital Strategy",
    description:
      "Data-driven approaches to transform your digital presence and drive measurable growth.",
    projects: "150+",
  },
  {
    icon: Globe,
    title: "Web Development",
    description:
      "Scalable, high-performance websites and applications using cutting-edge technologies.",
    projects: "200+",
  },
  {
    icon: Sparkles,
    title: "Brand Design",
    description:
      "Memorable brand identities that connect with audiences and stand out in competitive markets.",
    projects: "120+",
  },
  {
    icon: TrendingUp,
    title: "Digital Marketing",
    description:
      "Result-oriented campaigns that increase visibility, engagement, and conversions.",
    projects: "85+",
  },
];

const timeline = [
  {
    year: "2018",
    title: "Foundation",
    description: "Started as a small design studio in Lagos, Nigeria.",
  },
  {
    year: "2019",
    title: "Expansion",
    description:
      "Expanded to full-service digital agency with first major corporate client.",
  },
  {
    year: "2020",
    title: "Growth",
    description:
      "Tripled team size and launched innovative digital solutions during pandemic.",
  },
  {
    year: "2022",
    title: "Innovation",
    description:
      "Introduced AI-powered solutions and expanded to international markets.",
  },
  {
    year: "2023",
    title: "Awards",
    description:
      "Recognized as 'Top Digital Agency in West Africa' by Tech Awards Africa.",
  },
  {
    year: "2024",
    title: "Future",
    description:
      "Launching Dexta Labs - our innovation hub for emerging technologies.",
  },
];

const teamMembers = [
  {
    name: "Daniel Azu",
    role: "Creative Director & Co-founder",
    bio: "15+ years in digital design. Previously led design at major African fintech startups.",
    expertise: ["UI/UX Design", "Brand Strategy", "Creative Direction"],
    funFact: "Designed award-winning interfaces for 3 million+ users",
  },
  {
    name: "Alison Eyuren",
    role: "Technical Lead & Co-founder",
    bio: "Full-stack engineer specializing in scalable solutions. Ex-Senior Engineer at tech unicorn.",
    expertise: ["Web Architecture", "DevOps", "System Design"],
    funFact: "Built systems handling 10k+ concurrent users",
  },
  {
    name: "Chika Nwosu",
    role: "Head of Digital Marketing",
    bio: "8 years driving growth for African startups. ROI-focused campaign strategist.",
    expertise: ["SEO", "Paid Media", "Growth Hacking"],
    funFact: "Increased client revenue by 300% in 6 months",
  },
  {
    name: "Temi Adeyemi",
    role: "Lead Developer",
    bio: "Next.js & React expert. Passionate about performance optimization and clean code.",
    expertise: ["Frontend Architecture", "Performance", "TypeScript"],
    funFact: "Reduced page load times by 85% across projects",
  },
];

export function AboutHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Reverse scroll effect: as you scroll DOWN, content subtly moves UP.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0]);
  const statsY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const statsOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] text-white overflow-hidden"
    >
      {/* Background image (static) */}
      <div className="absolute inset-0 bg-black">
        <Image
          src="/images/about.png"
          alt="Dexta team collaborating in a modern digital studio"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Blue overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-cyan-950/55 to-black/40" />
      <div className="absolute inset-0 bg-blue-500/10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-6xl mx-auto">
          <div>
            <motion.div
              className="mb-10 lg:mb-12 text-center lg:text-left"
              style={{ y: contentY, opacity: contentOpacity }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 leading-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]">
                Redefining Digital{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Excellence
                </span>
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-white/80 leading-relaxed max-w-3xl mx-auto lg:mx-0 font-light drop-shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
                We're a forward-thinking digital agency based in Nigeria,
                crafting exceptional digital experiences that drive business
                growth across Africa and beyond.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto lg:mx-0"
              style={{ y: statsY, opacity: statsOpacity }}
            >
              {[
                { value: "6+", label: "Years Excellence" },
                { value: "200+", label: "Projects Delivered" },
                { value: "98%", label: "Client Retention" },
                { value: "50+", label: "Happy Clients" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 sm:p-6 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/75 mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StorySection() {
  return (
    <section className="py-20 lg:py-32 bg-white text-[#212529] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50/40 to-white" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                From Passion to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Impact
                </span>
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Founded in 2018 in the heart of Lagos, Dexta began as a passion
                project between two digital natives who saw the immense
                potential in Africa's tech landscape.
              </p>

              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Today, we've grown into a full-service digital agency that
                combines global standards with local expertise, helping
                businesses across Africa compete on the world stage through
                innovative digital solutions.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-cyan-500 to-purple-600"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-semibold">
                    Trusted by Industry Leaders
                  </div>
                  <div className="text-sm text-gray-500">
                    Banking • E-commerce • Healthcare • Fintech
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              {/* Timeline */}
              <div className="space-y-8">
                {timeline.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.year}
                    className="flex items-start gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                          {item.year}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExpertiseSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Where Digital{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Magic Happens
            </span>
          </h2>

          <p className="text-xl text-gray-400">
            We combine strategy, design, and technology to create digital
            experiences that not only look beautiful but drive real business
            results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={area.title}
                className="group relative p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-cyan-400" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {area.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-sm text-gray-500">
                      Projects Completed
                    </span>
                    <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {area.projects}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TeamSection() {
  return (
    <section className="py-20 lg:py-32 bg-white text-[#212529]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The Minds Behind the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              Magic
            </span>
          </h2>

          <p className="text-xl text-gray-600">
            Meet the passionate professionals dedicated to turning your vision
            into exceptional digital reality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 h-full shadow-sm hover:shadow-lg transition-shadow">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto">
                    <span className="text-3xl font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-center mb-2">
                  {member.name}
                </h3>
                <p className="text-cyan-400 text-sm text-center font-semibold mb-4">
                  {member.role}
                </p>

                <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
                  {member.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {member.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Fun Fact */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Fun Fact</div>
                  <div className="text-sm text-cyan-700">{member.funFact}</div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Culture note */}
        <motion.div
          className="max-w-3xl mx-auto mt-16 p-8 rounded-3xl border border-gray-200 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-white text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-4">Our Culture</h3>
          <p className="text-gray-600 text-lg">
            We believe in collaborative innovation, continuous learning, and
            creating solutions that make a real difference. Our team embodies
            the spirit of modern Africa — ambitious, creative, and globally
            competitive.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ValuesSection() {
  const values = [
    {
      icon: Target,
      title: "Excellence in Execution",
      description:
        "We don't just meet expectations; we exceed them with meticulous attention to detail and quality.",
    },
    {
      icon: Lightbulb,
      title: "Innovation as Standard",
      description:
        "Constantly exploring new technologies and methodologies to stay ahead of the curve.",
    },
    {
      icon: HeartHandshake,
      title: "Partnership Mentality",
      description:
        "Your success is our success. We work as an extension of your team.",
    },
    {
      icon: Shield,
      title: "Integrity & Transparency",
      description:
        "Honest communication, ethical practices, and clear processes at every stage.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Our Core{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Values
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The principles that guide every decision we make and every project
              we undertake.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="group relative p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-cyan-400" />
                      </div>
                      <h3 className="text-2xl font-bold">{value.title}</h3>
                    </div>

                    <p className="text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16 pt-16 border-t border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-3xl font-bold mb-6">
              Ready to Build Something Amazing Together?
            </h3>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help transform your digital presence and
              drive your business forward.
            </p>
            <Link href="/offers">
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
                Start Your Project
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
