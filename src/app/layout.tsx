import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Suspense, type ReactNode } from "react";

import { OSRoot } from "@/components/os/OSRoot";
import { SHELL_BOOTSTRAP } from "@/components/os/shell-bootstrap";
import { ServerSemanticShell } from "@/components/normal/ServerNormalShell";
import { siteConfig } from "@/registry";
import { homeTitle, seoBrandName } from "@/registry/seo";

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
    default: `${homeTitle} | ${seoBrandName}`,
    template: `%s | ${seoBrandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  verification: { google: "XfjiFKGii47m_ZaujAiHDBw46zu4gmpRWtc2c7g-18M" },
  openGraph: {
    title: `${homeTitle} | ${seoBrandName}`,
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
    title: `${homeTitle} | ${seoBrandName}`,
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
        {process.env.VERCEL_ENV === "production" && <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NT39N3WH" height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" /></noscript>}
        <Suspense
          fallback={
            <ServerSemanticShell>{children}</ServerSemanticShell>
          }
        >
          <OSRoot>{children}</OSRoot>
        </Suspense>
        <Script id="google-tag-manager" strategy="afterInteractive">{`if(window.location.hostname==='westcoselabs.com'||window.location.hostname==='www.westcoselabs.com'){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NT39N3WH');}`}</Script>
      </body>
    </html>
  );
}
