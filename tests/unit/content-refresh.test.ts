import { describe, expect, it } from "vitest";
import { legPose } from "@/components/eggs/creature-walk";
import { experimentRegistry } from "@/registry/portfolio";
import { getProject } from "@/registry/projects";
import { getNote } from "@/registry/notes";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("experiment evidence and presentation", () => {
  it("keeps the five actual playgrounds and only gives demos a demo key", () => {
    const demos = experimentRegistry.filter(e => e.presentation === "live-demo");
    expect(demos.map(e => e.slug).sort()).toEqual(["accessible-unlock", "pocket-viewport", "three-shell-router", "westcose-world", "window-geometry"]);
    for (const experiment of experimentRegistry) {
      expect(Boolean(experiment.demoKey)).toBe(experiment.presentation === "live-demo");
      if (experiment.projectSlug) expect(getProject(experiment.projectSlug)).toBeDefined();
      if (experiment.relatedNoteId) expect(getNote(experiment.relatedNoteId)).toBeDefined();
      if (experiment.art) expect(existsSync(join(process.cwd(), "public", experiment.art.src))).toBe(true);
    }
  });
});

describe("two-legged walk cycle", () => {
  it("brings each leg forward on alternating contacts and lifts each on its own passing phase", () => {
    const forward = Math.PI / 2;
    expect(legPose(forward, "near").stride).toBeGreaterThan(0);
    expect(legPose(forward, "far").stride).toBeLessThan(0);
    expect(legPose(forward + Math.PI, "near").stride).toBeLessThan(0);
    expect(legPose(forward + Math.PI, "far").stride).toBeGreaterThan(0);
    expect(legPose(0, "near").lift).toBeGreaterThan(0);
    expect(legPose(0, "far").lift).toBe(0);
    expect(legPose(Math.PI, "far").lift).toBeGreaterThan(0);
    expect(legPose(Math.PI, "near").lift).toBe(0);
  });
});
