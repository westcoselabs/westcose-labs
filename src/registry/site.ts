import type { SiteConfig } from "./types";
import { parseSiteOrigin } from "../lib/site-origin";

const configuredSiteUrl = parseSiteOrigin(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://westcoselabs.com",
);
if (!configuredSiteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be a public HTTPS origin without a path, query, or credentials. The default is https://westcoselabs.com.",
  );
}
const configuredContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
const configuredGitHubUrl = process.env.NEXT_PUBLIC_GITHUB_URL?.trim();

function isHttpsUrl(value: string | undefined): value is `https://${string}` {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export const siteConfig = {
  name: "WestCose Labs OS",
  ownerName: "Brandon",
  description:
    "WestCose Labs designs and builds custom websites for businesses. Explore website design, web development, and recent projects, then discuss your website.",
  siteUrl: configuredSiteUrl,
  siteUrlConfigured: Boolean(configuredSiteUrl),
  contactEmail: isEmail(configuredContactEmail)
    ? configuredContactEmail
    : null,
  contactEmailConfigured: isEmail(configuredContactEmail),
  phoneDisplay: "+1 612-741-7277",
  phoneE164: "+16127417277",
  githubUrl: isHttpsUrl(configuredGitHubUrl) ? configuredGitHubUrl : null,
  githubConfigured: isHttpsUrl(configuredGitHubUrl),
  socials: [],
} as const satisfies SiteConfig;

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
