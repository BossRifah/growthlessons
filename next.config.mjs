import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load sharp as a native module from node_modules at runtime instead of
  // bundling it, so its native binaries resolve correctly on Vercel.
  serverExternalPackages: ["sharp"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withPayload(nextConfig);
