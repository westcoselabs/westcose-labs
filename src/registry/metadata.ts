import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "./site";

export function createRouteMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
}): Metadata {
  const fullTitle =
    title === siteConfig.name ? title : `${title} | ${siteConfig.name}`;
  const shareImage = image ?? {
    src: "/images/wallpapers/dusk-desktop.webp",
    width: 1536,
    height: 1024,
    alt: "WestCose Labs OS Dusk workstation landscape",
  };

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
          url: absoluteUrl(shareImage.src),
          width: shareImage.width,
          height: shareImage.height,
          alt: shareImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(shareImage.src)],
    },
  };
}
