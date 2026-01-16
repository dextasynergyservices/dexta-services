import type { Metadata } from "next";
import { Inter, Manrope, Poppins } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/layout/providers";
import "./globals.css";
import "./globals-3d.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Dexta Synergy Services",
    template: "%s | Dexta Synergy Services",
  },
  description: "Building Digital Ecosystems for SMEs and Startups.",
  openGraph: {
    title: "Dexta Synergy Services",
    description: "Building Digital Ecosystems for SMEs and Startups.",
    url: "https://dexta.synergy",
    siteName: "Dexta Synergy Services",
    images: [
      {
        url: "https://dexta.synergy/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Dexta Synergy Services",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Main St",
      addressLocality: "Anytown",
      addressRegion: "CA",
      postalCode: "12345",
      addressCountry: "US",
    },
    telephone: "+1-234-567-8901",
    email: "contact@dextasynergy.com",
    url: "https://dexta.synergy",
  };

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${manrope.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
