import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { parseSiteOrigin } from "@/lib/site-origin";
import { getRouteParent } from "@/lib/routes";
import { createRouteMetadata } from "@/registry/metadata";
import { getRouteDescriptor } from "@/registry/routes";
import { isIndexablePath } from "@/registry/seo";
import { siteConfig } from "@/registry/site";

describe("search configuration", () => {
  it("uses the confirmed public origin throughout crawl discovery", () => {
    expect(siteConfig.siteUrl).toBe("https://westcoselabs.com");
    const entries = sitemap();
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);
    expect(entries.every((entry) => new URL(entry.url).origin === siteConfig.siteUrl)).toBe(true);
    expect(robots().sitemap).toBe(`${siteConfig.siteUrl}/sitemap.xml`);
    for (const path of ["/services/website-design", "/services/web-development", "/experiments/westcose-world", "/projects/barber-refinery"]) {
      expect(entries.some((entry) => entry.url === `${siteConfig.siteUrl}${path}`)).toBe(true);
    }
    expect(entries.some((entry) => entry.url.endsWith("/games/arcade"))).toBe(false);
  });

  it.each(["/settings", "/settings/appearance", "/notes", "/notes/folder/all-notes", "/notes/client-phrases", "/recycle", "/terminal", "/github"])("keeps %s out of search without blocking link following", (path) => {
    expect(isIndexablePath(path)).toBe(false);
    const metadata = createRouteMetadata({ title: "Utility", description: "Utility page", path });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(sitemap().some((entry) => entry.url === `${siteConfig.siteUrl}${path}`)).toBe(false);
  });

  it.each(["/services/website-design", "/services/web-development"])("opens %s inside the Services app with the right parent", (path) => {
    expect(getRouteDescriptor(path)).toMatchObject({ appId: "services", parentPath: "/services" });
    expect(getRouteParent(path)).toBe("/services");
    expect(createRouteMetadata({ title: "Service", description: "Service page", path }).robots).toBeUndefined();
  });

  it("normalizes a valid origin and rejects canonical URLs that would point to the wrong place", () => {
    expect(parseSiteOrigin(" https://westcoselabs.com/ ")).toBe("https://westcoselabs.com");
    for (const value of [undefined, "", "westcoselabs.com", "http://westcoselabs.com", "https://localhost", "https://127.0.0.1", "https://[::1]", "https://user:password@westcoselabs.com", "https://westcoselabs.com/preview", "https://westcoselabs.com?view=normal", "https://westcoselabs.com/#home"]) {
      expect(parseSiteOrigin(value), String(value)).toBeUndefined();
    }
  });
});
