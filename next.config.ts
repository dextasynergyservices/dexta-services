import type { NextConfig } from "next";

function getCloudflareR2ImageRemotePattern() {
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim();

  if (!publicBaseUrl) {
    return null;
  }

  try {
    const url = new URL(publicBaseUrl);

    if (url.protocol !== "https:") {
      return null;
    }

    return {
      protocol: "https" as const,
      hostname: url.hostname,
    };
  } catch {
    return null;
  }
}

const cloudflareR2ImageRemotePattern = getCloudflareR2ImageRemotePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(cloudflareR2ImageRemotePattern
        ? [cloudflareR2ImageRemotePattern]
        : []),
    ],
  },
};

export default nextConfig;
