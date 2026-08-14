import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "J.A.R.V.I.S. — Just A Rather Very Intelligent System",
  description:
    "An Iron Man inspired AI assistant interface: holographic HUD, arc reactor telemetry, threat matrix and a voice-enabled command console.",
};

export const viewport: Viewport = {
  themeColor: "#01060d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
