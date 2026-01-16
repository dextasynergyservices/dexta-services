"use client";

import { useEffect, useState } from "react";

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Create intersection observer to track which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section with the largest intersection ratio
        let maxRatio = 0;
        let activeId = "";

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeId = entry.target.id;
          }
        });

        if (activeId) {
          setActiveSection(activeId);
        }
      },
      {
        threshold: [0.1, 0.25, 0.5, 0.75],
        rootMargin: "-50% 0px -50% 0px", // Trigger when section is in the middle of viewport
      },
    );

    // Observe all sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return activeSection;
}
