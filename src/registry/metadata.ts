import type { Metadata } from "next";

import { absoluteUrl } from "./site";
import { isIndexablePath, seoBrandName } from "./seo";

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
  const fullTitle = `${title} | ${seoBrandName}`;
  const shareImage = image ?? {
    src: "/images/wallpapers/dusk-desktop.webp",
    width: 1536,
    height: 1024,
    alt: "WestCose Labs OS Dusk workstation landscape",
  };

  return {
    title: { absolute: fullTitle },
    description,
    ...(!isIndexablePath(path) ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: seoBrandName,
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
