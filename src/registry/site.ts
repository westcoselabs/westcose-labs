import type { SiteConfig } from "./types";

const siteUrlCandidate = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const configuredSiteUrl = isHttpsUrl(siteUrlCandidate)
  ? siteUrlCandidate
  : undefined;
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
    "A tactile, late-2000s-inspired portfolio for software, games, and experiments.",
  siteUrl: configuredSiteUrl || "http://localhost:3000",
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
