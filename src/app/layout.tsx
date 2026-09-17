import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Suspense, type ReactNode } from "react";

import { OSRoot } from "@/components/os/OSRoot";
import { SHELL_BOOTSTRAP } from "@/components/os/shell-bootstrap";
import { ServerSemanticShell } from "@/components/normal/ServerNormalShell";
import { siteConfig } from "@/registry";

import "./globals.css";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
});

const ibmPlexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    images: [
      {
        url: "/images/wallpapers/dusk-desktop.webp",
        width: 1536,
        height: 1024,
        alt: "WestCose Labs OS Dusk workstation landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/images/wallpapers/dusk-desktop.webp"],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  initialScale: 1,
  themeColor: "#1C1F25",
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${manrope.variable} ${ibmPlexMono.variable}`}
      data-shell="normal"
      data-theme="dusk"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SHELL_BOOTSTRAP }} />
      </head>
      <body>
        <Suspense
          fallback={
            <ServerSemanticShell>{children}</ServerSemanticShell>
          }
        >
          <OSRoot>{children}</OSRoot>
        </Suspense>
      </body>
    </html>
  );
}
