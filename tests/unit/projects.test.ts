import { describe, expect, it } from "vitest";

import { createRouteMetadata, getProject, projectRegistry } from "@/registry";

describe("curated projects", () => {
  it("includes the selected repositories and all four client websites", () => {
    expect(projectRegistry).toHaveLength(14);
    expect(new Set(projectRegistry.map((p) => p.slug)).size).toBe(14);
    for (const project of projectRegistry) {
      expect(project.liveUrl ?? project.githubUrl).toMatch(/^https:\/\//);
      expect(project.shortDescription.length).toBeGreaterThan(20);
    }
    expect(getProject("mission-control")).toBeUndefined();
    expect(getProject("salescout")).toBeUndefined();
    expect(getProject("gitpress")?.featured).toBe(true);
    expect(getProject("gitpress-forms")?.status).toBe("preview");
  });
  it("preserves the supplied destinations and distinguishes private source and redesign previews", () => {
    expect(getProject("barber-refinery")).toMatchObject({
      liveUrl: "https://barberrefinery.com/",
      githubUrl:
        "https://github.com/citrynmarketingdevelopment/barberrefinery-frontend",
      repositoryPrivate: true,
    });
    expect(getProject("first-medical-associates")).toMatchObject({
      liveUrl: "https://drsfirst.com/",
      githubUrl: "https://github.com/firstmedicalassociates/fma-website",
    });
    expect(getProject("simply-decorated")).toMatchObject({
      liveUrl: "https://decoratedbyriley.com/",
      featured: true,
    });
    expect(getProject("simply-decorated")?.githubUrl).toBeUndefined();
    expect(getProject("trends-collision")).toMatchObject({
      liveUrl: "https://trendsautocollision.com/",
      previewUrl: "https://trends-frontend-eight.vercel.app/",
      status: "preview",
    });
    for (const project of projectRegistry) {
      for (const related of project.relatedProjectSlugs)
        expect(getProject(related)).toBeDefined();
    }
  });
  it("replaces the Estate fixture with verified beta facts and keeps established routes", () => {
    const estate = getProject("estate-sales-bakersfield");
    expect(estate).toMatchObject({
      status: "beta",
      liveUrl: "https://estate-sales-bakersfield.vercel.app",
    });
    expect(estate?.technologies).toContain("Next.js");
    expect(estate?.cover?.src).toContain("estate-sales-bakersfield.webp");
    expect(estate?.relatedProjectSlugs).toContain("westcose-labs-os");
    expect(getProject("westcose-labs-os")?.relatedProjectSlugs).toContain(
      "estate-sales-bakersfield",
    );
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
