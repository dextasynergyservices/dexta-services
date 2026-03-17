# Dexta Services - Complete Codebase Documentation

**Last Updated:** March 16, 2026  
**Project:** Dexta Synergy Services Portfolio Website  
**Status:** Active Development

---

## 1. PROJECT OVERVIEW

**Dexta Services** is a premium creative agency portfolio website showcasing three main service categories:
- **Design** - Branding, UI/UX, Mobile App Design
- **Build** - Web Development, E-commerce, Enterprise Solutions
- **Print** - Marketing Materials, Large Format, Catalogs

The website is built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and modern animations using **Framer Motion**.

**Key Objective:** Create a modern, sleek, professional portfolio with tabbed navigation, search functionality, pagination, and an interactive gallery modal system.

---

## 2. TECHNOLOGY STACK

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | Full-stack React framework | 16.1.2 |
| **TypeScript** | Type safety | Latest |
| **Tailwind CSS** | Utility-first styling | v4 |
| **React** | UI library | 19.2.3 |
| **Framer Motion** | Animations & transitions | 12.23.24 |
| **Lucide React** | Icons | 0.555.0 |
| **Prisma** | ORM & Database | 7.0.1 |
| **TanStack Query** | Data fetching | 5.90.11 |
| **React Hook Form** | Form handling | 7.66.1 |
| **Zod** | Schema validation | 4.1.13 |
| **pnpm** | Package manager | Latest |
| **ESLint** | Code linting | Latest |
| **Husky** | Git hooks | Latest |

**Key Dependencies:**
- `@google-cloud/recaptcha-enterprise` - reCAPTCHA security
- `@getbrevo/brevo` - Email service
- `next-cloudinary` - Image delivery
- `react-google-recaptcha-v3` - Form spam protection
- `@react-three/fiber` - 3D graphics (optional)

---

## 3. FOLDER STRUCTURE

```
c:\Users\DEXTA-BUILD\Documents\dexta-services/
├── public/                          # Static assets
│   ├── images/                      # Image assets
│   └── videos/                      # Video assets
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home page
│   │   ├── actions.ts               # Server Actions for forms
│   │   ├── globals.css              # Global styles & Tailwind
│   │   ├── globals-3d.css           # 3D specific styles
│   │   ├── sitemap.ts               # Dynamic sitemap for SEO
│   │   ├── about/
│   │   │   └── page.tsx             # About page
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact page
│   │   ├── services/
│   │   │   └── page.tsx             # Services listing page
│   │   ├── offers/
│   │   │   ├── page.tsx             # Main offers page
│   │   │   ├── business/
│   │   │   │   └── page.tsx         # Business offers
│   │   │   ├── churches/
│   │   │   │   └── page.tsx         # Church offers
│   │   │   └── schools/
│   │   │       └── page.tsx         # School offers
│   │   └── projects/
│   │       └── page.tsx             # Unified projects/portfolio page
│   │
│   ├── components/                  # Reusable React components
│   │   ├── ui/                      # Base UI components (Shadcn)
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── card-stack.tsx       # 3D card stack effect
│   │   │   ├── hover-footer.tsx     # Hover footer animation
│   │   │   ├── magnetic-button.tsx  # Magnetic button effect
│   │   │   ├── project-modal.tsx    # Project detail modal
│   │   │   └── sheet.tsx            # Sheet/drawer component
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── navbar.tsx           # Navigation bar (sticky, responsive)
│   │   │   ├── page-transition.tsx  # Page transition effects
│   │   │   └── providers.tsx        # Client-side providers (QueryClient, etc)
│   │   │
│   │   ├── home/                    # Homepage components
│   │   │   ├── hero.tsx             # Hero section
│   │   │   ├── services-section.tsx # Services cards with navigation
│   │   │   ├── project-gallery.tsx  # Featured projects section
│   │   │   ├── floating-elements.tsx # Floating background elements
│   │   │   ├── parallax-image.tsx   # Parallax image effect
│   │   │   ├── textParallaxSection.tsx # Text parallax section
│   │   │   ├── contact-form.tsx     # Contact form
│   │   │   └── footer.tsx           # Footer
│   │   │
│   │   ├── offers/                  # Offer/pricing components
│   │   │   ├── index.ts             # Exports
│   │   │   ├── config.ts            # Offer configuration
│   │   │   ├── types.ts             # TypeScript types
│   │   │   ├── audience-hero.tsx    # Audience-specific hero
│   │   │   ├── pricing-card.tsx     # Individual pricing card
│   │   │   ├── pricing-section.tsx  # Pricing grid section
│   │   │   └── features-list.tsx    # Feature list component
│   │   │
│   │   ├── services/                # Services components
│   │   │   └── index.tsx            # Services component
│   │   │
│   │   ├── shared/                  # Shared/utility components
│   │   │   ├── custom-cursor.tsx    # Custom cursor effect
│   │   │   ├── enhanced-cursor.tsx  # Enhanced cursor with trail
│   │   │   ├── scroll-reveal.tsx    # Scroll reveal animation
│   │   │   └── text-reveal.tsx      # Text reveal effect
│   │   │
│   │   ├── about/                   # About page components
│   │   │   └── index.tsx            # About section
│   │   │
│   │   ├── contact/                 # Contact page components
│   │   │   └── index.tsx            # Contact section
│   │   │
│   │   └── projectPage.tsx          # 🔑 MAIN PROJECTS PAGE
│   │       # Unified portfolio with:
│   │       # - Tab navigation (Design/Build/Print)
│   │       # - Search functionality
│   │       # - Filtering by category
│   │       # - Pagination (6 items per page)
│   │       # - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
│   │       # - Gallery modal with thumbnail grid
│   │       # - Project data with gallery images and descriptions
│   │
│   ├── hooks/                       # React hooks
│   │   ├── use-active-section.ts    # Detect active page section
│   │   └── use-projects.ts          # Project data hook
│   │
│   ├── lib/                         # Utility functions & config
│   │   ├── api.ts                   # API utilities
│   │   ├── prisma.ts                # Prisma client setup
│   │   ├── utils.ts                 # Utility functions
│   │   └── validators.ts            # Zod schema validators
│   │
│   ├── assets/                      # Project assets
│   │   └── fonts/                   # Custom fonts (Clash Display)
│   │
│   └── global.d.ts                  # Global TypeScript declarations
│
├── prisma/                          # Database schema
│   ├── schema.prisma                # Prisma schema definition
│   └── prisma.config.ts             # Prisma config
│
├── Configuration Files (Root)
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tailwind.config.ts           # Tailwind CSS config
│   ├── next.config.ts               # Next.js config
│   ├── postcss.config.mjs           # PostCSS config
│   ├── eslint.config.mjs            # ESLint rules
│   ├── components.json              # Shadcn UI config
│   ├── prisma.config.ts             # Prisma config
│   ├── proxy.ts                     # Next.js 16 Proxy (replaces middleware)
│   ├── README.md                    # Project README
│   ├── project-context.md           # Project context document
│   ├── pnpm-lock.yaml               # pnpm lock file
│   └── CODEBASE_DOCUMENTATION.md    # This file
```

---

## 4. DESIGN SYSTEM & BRANDING

### Color Scheme

| Color | Hex Value | Usage |
|-------|-----------|-------|
| **Cyan/Electric Blue** | `#00b2ff` | Primary action, active states, highlights |
| **Purple** | `#6b21a8` (or similar) | Gradient accents |
| **Pink** | `#ec4899` (or similar) | Gradient accents |
| **Dark Background** | `#0a0a0a` | Dark mode background |
| **Card Background** | `#1a1a1a` | Card and container backgrounds |
| **Border Color** | `#333333` | Subtle borders |
| **Text Primary** | `#ffffff` | Main text |
| **Text Secondary** | `#a0a0a0` | Secondary text, descriptions |
| **Text Muted** | `#666666` | Disabled or subtle text |

### Typography

| Element | Font | Weight | Size | Usage |
|---------|------|--------|------|-------|
| **Headings** | Clash Display (Variable) | Bold | 2xl-4xl | Page titles, section headers |
| **Subheadings** | Clash Display | Bold | lg-2xl | Section subheadings |
| **Body** | Inter / Manrope | Regular | sm-base | Body text, descriptions |
| **Small** | Inter / Manrope | Regular | xs-sm | Tags, metadata, captions |

### Responsive Breakpoints

| Breakpoint | Screen Size | Tailwind |
|-----------|-----------|----------|
| Mobile | < 640px | (default) |
| Tablet | ≥ 640px | `sm:` |
| Desktop | ≥ 1024px | `lg:` |
| Large Desktop | ≥ 1280px | `xl:` |

---

## 5. KEY FEATURES & IMPLEMENTATION

### A. Navigation & Layout

**Navbar Component** (`navbar.tsx`)
- Sticky positioning with `sticky top-0 z-40`
- Backdrop blur effect for modern look
- Logo on left, menu items in center, CTA button on right
- Mobile hamburger menu
- Active section highlighting

**Footer Component** (`footer.tsx`)
- Multi-column layout with company info, services, socials
- Located in `components/home/footer.tsx`

### B. Projects/Portfolio Page (`projectPage.tsx`) 🔑 CORE FEATURE

**Location:** `/src/components/projectPage.tsx`  
**Route:** `/projects` or `/projects?tab=design|build|print`

#### Features:
1. **Tab Navigation**
   - Design, Build, Print tabs
   - URL sync with `useSearchParams`
   - Auto-switch to tab from query parameter

2. **Search Functionality**
   - Search by project title, description, tags
   - Real-time filtering
   - Search input in header

3. **Category Filtering**
   - Filter by project category (optional, expandable)
   - Displays unique categories for active tab

4. **Pagination**
   - **6 projects per page** (PROJECTS_PER_PAGE = 6)
   - Previous/Next buttons
   - Page number navigation
   - Resets to page 1 when tab/filters change

5. **Project Cards (Grid Display)**
   - **Grid Layout:**
     - Mobile: 1 column
     - Tablet (sm): 2 columns
     - Desktop (lg): 3 columns
   - **Image Display:**
     - Aspect ratio: `16:9` (widescreen, compact)
     - Hover zoom effect (scale-110)
     - Clickable to open gallery modal
   - **Card Content:**
     - Category badge (cyan background)
     - Project title (bold, large)
     - Short description (2 lines max, line-clamp-2)
     - Tags display (first 2 tags)

6. **Gallery Modal** (Open on card click)
   - Full-screen overlay with backdrop blur
   - **Image Viewer:**
     - Large main image display
     - Aspect ratio: `aspect-video` on sm+, `aspect-square` on mobile
   - **Navigation:**
     - Previous/Next buttons on sides
     - Thumbnail grid (2 cols on mobile, 3 cols on desktop)
     - Image counter (e.g., "1 / 3")
   - **Project Details Section:**
     - Full title
     - Full description
     - All tags displayed
     - **"Visit Website" button** (if websiteUrl exists, opens in new tab)
     - "View Full Details" button

#### Data Structure (projectsData)

```typescript
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;           // Main thumbnail image
  gallery: string[];       // Array of 3 images for gallery
  link: string;            // Internal link
  websiteUrl?: string;     // External website (for website projects only)
}

const projectsData = {
  design: [
    {
      id: 1,
      title: "Brand Identity Suite",
      description: "Complete brand identity including logo...",
      category: "Branding",
      tags: ["Logo Design", "Brand Guidelines", "Visual Identity"],
      image: "https://images.unsplash.com/...",
      gallery: [
        "https://images.unsplash.com/...",
        "https://images.unsplash.com/...",
        "https://images.unsplash.com/...",
      ],
      link: "/projects/design/brand-identity",
    },
    // ... more projects
  ],
  prints: [
    // Similar structure for print projects
    // 4 print projects: Annual Report, Product Catalog, Exhibition Stand, Marketing Brochures
  ],
  websites: [
    // Website projects with websiteUrl field
    // 4 website projects: E-commerce Platform, Corporate Portal, Portfolio Website, Booking System
  ]
}
```

#### Project Categories

**Design Tab (4 projects):**
1. Brand Identity Suite
2. UI/UX Dashboard
3. Mobile App Design
4. Logo & Visual Brand

**Print Tab (4 projects):**
1. Annual Report
2. Product Catalog
3. Exhibition Stand
4. Marketing Brochures

**Build/Website Tab (4 projects):**
1. E-commerce Platform (websiteUrl: "https://example-ecommerce.com")
2. Corporate Portal (websiteUrl: "https://example-portal.com")
3. Portfolio Website (websiteUrl: "https://example-portfolio.com")
4. Booking System (websiteUrl: "https://example-booking.com")

### C. Services Section (`services-section.tsx`)

**Location:** `/src/components/home/services-section.tsx`

- Displays 3 service cards: Design, Build, Print
- Each card has clickable "Explore more" button
- Navigation:
  - Design → `/projects?tab=design`
  - Build → `/projects?tab=build`
  - Print → `/projects?tab=print`

### D. Animations & Effects

**Framer Motion Used For:**
- Page transitions
- Card entrance animations (opacity fade-in + slide up)
- Modal opening/closing animations
- Hover effects (scale, color changes)
- Scroll reveal effects

**Custom CSS Effects:**
- Parallax scrolling
- Hover zoom on images
- Gradient overlays
- Text reveal animations
- 3D card transforms (card-stack)

### E. Forms & Validation

**Contact Form:**
- Uses React Hook Form + Zod validation
- Server Action integration
- reCAPTCHA v3 spam protection
- Email sent via Brevo service

---

## 6. ROUTING & PAGES

### App Router Structure

| Route | Component | File | Status |
|-------|-----------|------|--------|
| `/` | Home page | `app/page.tsx` | ✅ Active |
| `/about` | About page | `app/about/page.tsx` | ✅ Active |
| `/contact` | Contact page | `app/contact/page.tsx` | ✅ Active |
| `/services` | Services page | `app/services/page.tsx` | ✅ Active |
| `/projects` | Portfolio (with tabs) | `app/projects/page.tsx` | ✅ Active |
| `/projects?tab=design` | Design projects | `projectPage.tsx` (Design tab) | ✅ Active |
| `/projects?tab=build` | Build/Website projects | `projectPage.tsx` (Build tab) | ✅ Active |
| `/projects?tab=print` | Print projects | `projectPage.tsx` (Print tab) | ✅ Active |
| `/offers/business` | Business packages | `app/offers/business/page.tsx` | ✅ Active |
| `/offers/churches` | Church packages | `app/offers/churches/page.tsx` | ✅ Active |
| `/offers/schools` | School packages | `app/offers/schools/page.tsx` | ✅ Active |

### Query Parameters

| Parameter | Values | Usage |
|-----------|--------|-------|
| `tab` | `design`, `build`, `print` | Switch active tab on projects page |

---

## 7. STATE MANAGEMENT

### React Hooks Used

**projectPage.tsx:**
```typescript
const [activeTab, setActiveTab] = useState(tabParam);        // Current tab
const [searchTerm, setSearchTerm] = useState("");             // Search query
const [selectedCategory, setSelectedCategory] = useState();   // Filter category
const [currentPage, setCurrentPage] = useState(1);            // Pagination page
const [selectedProject, setSelectedProject] = useState(null); // Modal state
const [currentImageIndex, setCurrentImageIndex] = useState(0); // Gallery image index
```

### Global Providers

**Location:** `components/layout/providers.tsx`

- QueryClientProvider (TanStack Query)
- Theme provider (if using custom theme)
- Analytics/tracking (if configured)

---

## 8. STYLING CONVENTIONS

### Tailwind Classes Usage

**Responsive Layout:**
```tsx
// Mobile first approach
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
```

**Colors:**
```tsx
// Use CSS variable names and Tailwind utilities
className="bg-card border-border text-primary-text"
className="text-cyan-500 hover:text-cyan-400"
className="bg-gradient-to-r from-purple-600 to-cyan-500"
```

**Spacing:**
```tsx
// Consistent padding/margin system
className="p-4 sm:p-6 lg:p-8"
className="mb-3 sm:mb-4 lg:mb-6"
```

**Typography:**
```tsx
// Responsive text sizes
className="text-base sm:text-lg lg:text-xl"
// Font weights
className="font-bold font-semibold font-normal"
```

### Custom CSS Classes

**Location:** `app/globals.css`

```css
/* Font imports */
@font-face {
  font-family: 'Clash Display';
  src: url('/fonts/ClashDisplay-...');
}

/* Utility classes */
.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.gradient-text {
  background: linear-gradient(135deg, #00b2ff, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 9. DATABASE & PRISMA

### Setup

**Prisma Client Location:** `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Schema Location

**File:** `prisma/schema.prisma`

Used for:
- User data
- Contact form submissions
- Project/service information
- Analytics data

### Database Commands

```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database
pnpm prisma:push

# Open Prisma Studio (GUI)
pnpm prisma:studio
```

---

## 10. BUILD & DEPLOYMENT

### Build Process

```bash
# Development
pnpm dev        # Start dev server at localhost:3000

# Production build
pnpm build      # Runs: prisma generate && next build
pnpm start      # Start production server

# Code quality
pnpm lint       # Run ESLint
pnpm type-check # TypeScript type checking
pnpm format     # Check formatting
pnpm check      # Run all checks (lint + type-check + format)
```

### Build Output

- Next.js generates optimized static/dynamic pages
- Images optimized with next/image
- CSS purged and minified by Tailwind
- JavaScript code-split for faster loading

---

## 11. SEO & META TAGS

### Sitemap

**Location:** `app/sitemap.ts`

Dynamically generates sitemap based on routes.

### Metadata

**Location:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Dexta Synergy Services',
  description: 'Creative agency for design, build, and print',
  // ... more metadata
}
```

### JSON-LD Structured Data

**Format:** Local Business schema

---

## 12. IMPORTANT NOTES FOR AI/DEVELOPERS

### Key Principles

1. **Mobile-First Design** - Always start with mobile styles, use `sm:`, `lg:` for desktop
2. **Performance** - Use `next/image`, code-splitting, lazy loading
3. **Type Safety** - Always define TypeScript interfaces for data structures
4. **Server Actions** - Use for form submissions (faster than API routes)
5. **Responsive Grid** - Default 1 col → 2 cols on sm → 3 cols on lg

### Common Patterns

**Responsive Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map((item) => (...))}
</div>
```

**Card Component:**
```tsx
<div className="rounded-2xl bg-card border border-border p-4 sm:p-6">
  {/* content */}
</div>
```

**Button Styling:**
```tsx
<button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors">
  Button Text
</button>
```

**Animation:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### File Naming Conventions

- **Components:** PascalCase (e.g., `ProjectCard.tsx`)
- **Pages:** lowercase with folders (e.g., `app/about/page.tsx`)
- **Utilities:** camelCase (e.g., `useProjects.ts`, `formatDate.ts`)
- **Types:** PascalCase in separate file or inline (e.g., `types.ts`, `interface Project {}`)

### Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_URL="postgresql://..."

# APIs
NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY="..."
GOOGLE_RECAPTCHA_SECRET_KEY="..."

# Brevo Email
BREVO_API_KEY="..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# Other
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 13. RECENT CHANGES & UPDATES

### March 16, 2026 - Gallery & Rich Media Implementation

**Implemented:**
✅ Gallery arrays added to all 12 projects (3 images each)
✅ Interactive gallery modal with full-screen viewer
✅ Thumbnail grid navigation (2-3 columns responsive)
✅ Previous/Next image navigation with keyboard support
✅ Image counter display
✅ Project title, description, and tags in modal
✅ Website links for web projects (opens in new tab)
✅ Image aspect ratio optimized (16:9 on project cards)
✅ Compact card design (minimal padding, 1-2 line descriptions)
✅ Responsive modal for mobile and desktop

**Files Modified:**
- `src/components/projectPage.tsx` - Main projects component with gallery modal
- `src/components/home/services-section.tsx` - Navigation to projects tabs
- `src/app/projects/page.tsx` - Projects page route

### Earlier Features (Design to Current)

✅ Service cards with tab navigation
✅ Unified projects page (replacing individual /design, /build, /print)
✅ Search functionality across projects
✅ Pagination (6 items per page)
✅ Mobile responsive grid (1 col → 2 → 3)
✅ Sticky navbar with navigation
✅ Contact form with validation
✅ About & Services pages
✅ Custom animations with Framer Motion
✅ Responsive typography and spacing

---

## 14. FUTURE ENHANCEMENTS

### Potential Additions

- [ ] Dark mode toggle
- [ ] Testimonials/Reviews section
- [ ] Blog or case studies
- [ ] Client filtering by industry
- [ ] Advanced project filtering (multiple tags)
- [ ] Team member profiles
- [ ] Video backgrounds for hero
- [ ] Pricing calculator
- [ ] Live chat integration
- [ ] Performance analytics dashboard

---

## 15. TROUBLESHOOTING & COMMON ISSUES

### Type Errors

```bash
# Fix TypeScript errors
pnpm type-check
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Image Issues

- Ensure images are in `public/` folder or use external URLs
- Use `next/image` for optimization
- Check alt text for accessibility

### Styling Issues

- Clear Tailwind cache: `rm -rf .next`
- Check tailwind.config.ts for color definitions
- Use `className` not `class` in components

---

## 16. CONTACT & SUPPORT

**Project:** Dexta Synergy Services  
**Repository:** c:\Users\DEXTA-BUILD\Documents\dexta-services  
**Tech Lead:** [Your Name]  
**Last Updated:** March 16, 2026

---

**END OF DOCUMENTATION**

This document should provide AI assistants and developers with a complete understanding of the codebase structure, implementation, and how to contribute effectively.
