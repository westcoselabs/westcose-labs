import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "./site";

export function createRouteMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle =
    title === siteConfig.name ? title : `${title} — ${siteConfig.name}`;

  return {
    title: title === siteConfig.name ? { absolute: title } : title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: absoluteUrl("/images/wallpapers/dusk-desktop.webp"),
          width: 1536,
          height: 1024,
          alt: "WestCose Labs OS Dusk workstation landscape",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl("/images/wallpapers/dusk-desktop.webp")],
    },
  };
}
