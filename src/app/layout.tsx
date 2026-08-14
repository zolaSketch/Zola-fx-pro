import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ServiceWorker } from "@/components/core/ServiceWorker";

/**
 * Self-hosted variable fonts (via @fontsource-variable) so the UI renders
 * identically offline / behind a proxy — no runtime Google Fonts fetch.
 */
const orbitron = localFont({
  src: "../../node_modules/@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2",
  variable: "--font-orbitron",
  display: "swap",
  weight: "400 900",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const mono = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

// GitHub Pages serves the site under /<repo>, so absolute asset URLs in
// metadata need that prefix. Empty for the server build.
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. — Just A Rather Very Intelligent System",
  description:
    "An Iron Man inspired AI assistant: voice control, live knowledge, holographic HUD, arc reactor telemetry and a real tool-calling brain.",
  applicationName: "J.A.R.V.I.S.",
  manifest: `${BP}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${BP}/icon.svg`, type: "image/svg+xml" },
      { url: `${BP}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BP}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    // iOS ignores SVG and manifest icons; it needs an opaque PNG link tag.
    apple: [{ url: `${BP}/apple-touch-icon.png`, sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "JARVIS", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#01060d",
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom for accessibility, but keep the HUD edge-to-edge and
  // stop iOS zooming when the command input is focused.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${mono.variable}`}>
      <body className="antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
