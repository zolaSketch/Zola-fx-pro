import type { NextConfig } from "next";

/**
 * Two build modes:
 *
 *  - default  : full Next.js server, including /api/chat (LLM tool calling)
 *  - STATIC=1 : static export for GitHub Pages, where cognition runs entirely
 *               in the browser. Every tool, the offline knowledge core, memory
 *               and voice still work; only LLM chat needs the server.
 */
const isStatic = process.env.STATIC === "1";

// GitHub Pages serves project sites from /<repo>, so assets need that prefix.
const basePath = isStatic ? "/Zola-fx-pro" : "";

const nextConfig: NextConfig = {
  ...(isStatic
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXT_PUBLIC_STATIC: isStatic ? "1" : "0",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
