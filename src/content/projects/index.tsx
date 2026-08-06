import "server-only";

import type { ReactElement } from "react";

import EstateSalesBakersfield from "./estate-sales-bakersfield.mdx";

const projectContent = {
  "estate-sales-bakersfield": <EstateSalesBakersfield />,
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
