# Project: Dexta Synergy Services Redesign (2025)

## 1. Project Overview

We are rebuilding the corporate website for **Dexta Synergy Services**, a creative agency in Nigeria. The goal is to move from a generic "template" look to a high-end, "Digital Synergy" aesthetic.

## 2. Technical Stack

- **Framework:** Next.js 16 (App Router) - The new Next Js uses Proxy.ts instead of middleware.ts. Refer to this link: https://nextjs.org/blog/next-16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Library:** Shadcn UI (New York style, Zinc base)
- **State/Data:** TanStack Query v5 (React Query)
- **Validation:** Zod (Schema validation)
- **Forms:** React Hook Form + Next.js Server Actions
- **Animation:** Framer Motion (framer-motion)
- **Package Manager:** pnpm
- **Linting:** Husky (pre-commit hooks)
- **security:** Google Recaptcha
- **DB:** Prisma (Postgresql)
- **security:** Google Recaptcha
- **Emails:** BREVO
- **storage:** Cloudinary

## 3. Brand Identity

- **Primary Color:** Electric Blue (#00B2FF)
- **Secondary Color:** Dark Charcoal (#212529)
- **Background:** Clean White (#ffffff) or Deep Charcoal for dark sections.
- **Typography:**
  - Headings: **Clash Display** (Bold, Variable) or similar modern display font.
  - Body: **Inter** or **Manrope**.
- **Vibe:** Modern, Tech-forward, "Digital Ecosystems," Bold, Bento Grid layouts.

## 4. Folder Structure (Reference)

src/
├── app/
│ ├── actions.ts # Server Actions for forms
│ ├── layout.tsx # Root layout + Providers
│ ├── page.tsx # Home page (Hero + Bento)
│ ├── globals.css # Tailwind + CSS Variables
│ └── sitemap.ts # Dynamic Sitemap
├── components/
│ ├── ui/ # Shadcn components (button, card, etc)
│ ├── home/ # Hero, BentoGrid, ProjectGallery
│ ├── layout/ # Navbar, Footer
│ └── shared/ # ScrollReveal, SectionWrapper
├── lib/
│ ├── api.ts # Mock API fetchers
│ ├── utils.ts # Tailwind merger
│ └── validators.ts # Zod schemas
├── hooks/
│ └── use-projects.ts # TanStack Query hooks

## 5. Key Features & Implementation Rules

### A. Layout & Design

- **Navbar:** Sticky, backdrop-blur (bg-white/80), with a "Get a Quote" CTA (Outline variant, #00B2FF).
- **Hero:** No carousels. High-impact split layout. Headline: "Building Digital Ecosystems."
- **Services:** "Bento Grid" layout. 3-column grid with varied span sizes.
- **Footer:** Modern, multi-column.

### B. Data & Performance

- **Fetching:** Use `QueryClientProvider` at the root.
- **SEO Data:** Use **Server-Side Prefetching** (Hydration Boundary) in Server Components (page.tsx) for portfolio data so it is present in the HTML source.
- **Images:** `next/image` with WebP format.

### C. Interaction (The "Wow" Factor)

- **Scroll:** Use `framer-motion`. Create a <ScrollReveal> wrapper that fades elements up (y: 20 to y: 0) as they enter the viewport.
- **Forms:** Contact form must use **Next.js Server Actions** ("use server") validated with Zod. Do not use API routes for forms if Actions can suffice.

## 6. Detailed Development Phases

1.  **Scaffolding:** Setup Next.js 15, Tailwind, Shadcn, Husky, and pnpm.
2.  **Theming:** Update `tailwind.config.ts` with brand colors (#00B2FF, #212529) and fonts.
3.  **Core Components:** Build Navbar, Footer, and the base Hero section.
4.  **Bento Grid:** Build the Services section using CSS Grid/Tailwind Grid.
5.  **Data Layer:** Setup `TanStack Query` provider, mock API in `lib/api.ts`, and the `useProjects` hook.
6.  **Advanced Animation:** Install `framer-motion`. Wrap sections in scroll animations.
7.  **Server Actions:** Implement `src/app/actions.ts` for the Contact Form logic.
8.  **SEO & Metadata:** Add metadata objects to `layout.tsx`, generate `sitemap.ts`, and add `JSON-LD` for Local Business.

================================================================================
PART 2: AI SYSTEM PROMPT / RULES
(Paste this in .cursorrules or as the first prompt to your AI)
================================================================================

You are an expert Senior Frontend Engineer specializing in Next.js 15, TypeScript, and Modern UI Design.

**YOUR GOAL:**
Build a high-performance, visually stunning website for "Dexta Synergy Services" based on the provided context.

**STRICT TECHNICAL GUIDELINES:**

1.  **Tech Stack:** Use Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI, and TanStack Query v5.
2.  **Styling:**
    - Use Tailwind CSS for all styling.
    - Use CSS variables for colors defined in `globals.css` (mapped to Shadcn).
    - Primary Color: #00B2FF (Electric Blue).
    - Text Color: #212529 (Dark Charcoal).
3.  **Components:**
    - Always use `npx shadcn@latest add [component]` logic (simulated) to use existing UI patterns.
    - Create small, reusable components in `src/components`.
    - Use `lucide-react` for icons.
4.  **Data Fetching:**
    - Use TanStack Query for client-side data.
    - For SEO-critical data, use **Server Prefetching** with `HydrationBoundary`.
5.  **Forms:**
    - Use `react-hook-form` + `zod` for client-side validation.
    - Use **Server Actions** ("use server") for form submission logic.
6.  **Code Quality:**
    - Strict typing (no `any`).
    - Ensure all components represent the "Digital Synergy" design language (Bold fonts, Bento grids, smooth motion).

**PROCESS:**
When asked to build a feature, first analyze the file structure in `project-context.md`, then propose the code. Always prioritize clean, maintainable, and "production-ready" code.

================================================================================
PART 3: STEP-BY-STEP PROMPTS
(Copy and paste these one by one to build the site)
================================================================================

--- PHASE 1: INIT ---
"Act as a Senior Frontend Engineer. Read the project-context.md file. Initialize a new Next.js 15 (App Router) project using TypeScript and pnpm.
Requirements:

1. Setup Tailwind CSS.
2. Initialize Shadcn UI (New York style, Zinc base).
3. Install TanStack Query v5.
4. Configure Husky to run lint and type-check on pre-commit.
   Do not generate page content yet, just the config and structure."

--- PHASE 2: THEME ---
"Update `tailwind.config.ts` and `globals.css` to match the Dexta brand:

- Background: White
- Text: #212529
- Primary: #00B2FF
  Map Shadcn variables to these hex codes. Add the `.text-balance` utility and configure 'Inter' and 'Clash Display' (or similar) fonts in `layout.tsx`."

--- PHASE 3: HERO SECTION ---
"Create `src/components/home/hero.tsx`.
Design Specs:

- Layout: Split screen or centered high-impact.
- Background: White with subtle geometric shapes in #00B2FF (low opacity).
- Typography: Large H1 (Display font, #212529) 'Building Digital Ecosystems'.
- CTA: Shadcn Button (lg, bg-#00B2FF) 'Start Your Project'.
- Add a fade-in animation using Tailwind classes for now."

--- PHASE 4: BENTO GRID ---
"Create `src/components/home/services-section.tsx` using a Bento Grid layout.
Items:

1. Design (Large Box): UI/UX focus, gradient bg.
2. Build (Tall Box): Dev focus.
3. Print (Small Box): Physical branding.
   Interactive: Hover scale-105 and border-#00B2FF. Use Shadcn Card components."

--- PHASE 5: DATA & API ---
"Set up the data layer.

1. Create `src/lib/api.ts` with a mock fetcher for projects.
2. Create `src/hooks/use-projects.ts` using TanStack Query.
3. Create `src/components/home/project-gallery.tsx` using the hook.
4. Implement the 'Hydration Boundary' pattern in `src/app/page.tsx` to prefetch this data on the server for SEO."

--- PHASE 6: NAVIGATION ---
"Build `src/components/layout/navbar.tsx`.

- Desktop: Sticky, backdrop-blur. Links: Home, About, Services, Works, Contact.
- Mobile: Shadcn Sheet (hamburger menu).
- CTA: 'Get a Quote' button (Outline, #00B2FF).
- Logo: Bold text #212529."

--- PHASE 7: ANIMATION (WOW FACTOR) ---
"Install `framer-motion`. Create `src/components/shared/scroll-reveal.tsx`.
Function: Wrap children and animate them (opacity 0->1, y 50->0) when entering the viewport.
Apply this wrapper to the Hero, Bento Grid items, and Project Gallery cards."

--- PHASE 8: SERVER ACTIONS (CONTACT) ---
"Refactor the contact form using Next.js Server Actions.

1. Create `src/lib/validators.ts` with a Zod schema.
2. Create `src/app/actions.ts` with a `submitContactForm` function (simulated delay).
3. Update the form component to use `useFormStatus` for loading states.
   Ensure it handles validation errors gracefully."

--- PHASE 9: SEO FINISHING ---
"Implement Next.js 15 Metadata in `src/app/layout.tsx`.

- Add dynamic title template, description, and OpenGraph images.
- Create a `src/app/sitemap.ts` file.
- Add a JSON-LD snippet for a 'LocalBusiness' in the head."
