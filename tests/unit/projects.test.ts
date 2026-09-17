import { describe, expect, it } from "vitest";

import { createRouteMetadata, getProject, projectRegistry } from "@/registry";

describe("Phase 3 project case studies", () => {
  it("keeps both substantial case studies featured and cross-linked", () => {
    const estate = getProject("estate-sales-bakersfield");
    const os = getProject("westcose-labs-os");

    expect(estate).toMatchObject({
      featured: true,
      status: "development-fixture",
    });
    expect(os).toMatchObject({ featured: true, status: "published" });
    expect(estate?.relatedProjectSlugs).toContain("westcose-labs-os");
    expect(os?.relatedProjectSlugs).toContain("estate-sales-bakersfield");
  });

  it("does not promote unverified Estate facts into production metadata", () => {
    const estate = getProject("estate-sales-bakersfield");

    expect(estate?.technologies).toEqual([]);
    expect(estate?.role).toBeUndefined();
    expect(estate?.cover).toBeUndefined();
    expect(estate?.gallery).toEqual([]);
    expect(estate?.liveUrl).toBeUndefined();
    expect(estate?.githubUrl).toBeUndefined();
    expect(estate?.outcomes).toEqual([]);
  });

  it("gives every project a canonical metadata description and Open Graph image", () => {
    for (const project of projectRegistry) {
      const metadata = createRouteMetadata({
        description: project.shortDescription,
        image: project.cover,
        path: `/projects/${project.slug}`,
        title: project.title,
      });

      expect(metadata.description).toBe(project.shortDescription);
      expect(metadata.alternates?.canonical?.toString()).toContain(
        `/projects/${project.slug}`,
      );
      expect(metadata.openGraph?.images).toHaveLength(1);
    }
  });
});
