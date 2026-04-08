import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "./globals-3d.css";
import { fetchContactPageContent } from "@/lib/api";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contactContent = await fetchContactPageContent();
  const primaryEmail = contactContent.emails[0];
  const primaryPhone = contactContent.phones[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Dexta Synergy Services",
    address: contactContent.address,
    telephone: primaryPhone,
    email: primaryEmail,
    url: "https://dexta.synergy",
  };

  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
