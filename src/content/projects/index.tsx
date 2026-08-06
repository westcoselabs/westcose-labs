import "server-only";

import type { ReactElement } from "react";

import EstateSalesBakersfield from "./estate-sales-bakersfield.mdx";
import WestCoseLabsOS from "./westcose-labs-os.mdx";

const projectContent = {
  "estate-sales-bakersfield": <EstateSalesBakersfield />,
  "westcose-labs-os": <WestCoseLabsOS />,
} satisfies Record<string, ReactElement>;

export type ProjectContentSlug = keyof typeof projectContent;

export function getProjectContent(
  slug: string,
): ReactElement | undefined {
  return projectContent[slug as ProjectContentSlug];
}

export function hasProjectContent(slug: string): slug is ProjectContentSlug {
  return slug in projectContent;
}
