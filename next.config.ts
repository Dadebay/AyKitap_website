import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

function mediaPattern() {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_FILE_URL ?? "");
    return {
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      port: u.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: {
    // Trimmed candidate lists: with the defaults every card emits a ~1.2 KB
    // srcset, which dominated the home document (hundreds of cards).
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [96, 128, 256],
    remotePatterns: [
      ...(mediaPattern() ? [mediaPattern()!] : []),
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      { protocol: "http", hostname: "216.250.10.88", port: "9000", pathname: "/**" },
      { protocol: "http", hostname: "216.250.10.88", port: "4000", pathname: "/**" },
      { protocol: "http", hostname: "216.250.10.88", port: "4000", pathname: "/**" },
    ],
    // Local dev only: MinIO runs on localhost:9000 and Next 16's image
    // optimizer blocks loopback hosts by default (SSRF protection).
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default withNextIntl(nextConfig);
