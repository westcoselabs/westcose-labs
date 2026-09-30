import { describe, expect, it } from "vitest";
import {
  chooseOutbreakAlerts,
  finalRevision,
  FINAL_MARKERS,
  terminalSecretResponse,
} from "@/lib/personality-eggs";
import { boundedEvasion } from "@/components/ui/useEvasiveControl";

describe("personality egg rules", () => {
  it("keeps alert storms bounded and without duplicate notices", () => {
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      const alerts = chooseOutbreakAlerts(random);
      expect(alerts.length).toBeGreaterThanOrEqual(3);
      expect(alerts.length).toBeLessThanOrEqual(6);
      expect(new Set(alerts).size).toBe(alerts.length);
    }
  });
  it("reads bounded final revisions from existing restoration markers", () => {
    expect(finalRevision()).toBe(0);
    expect(finalRevision(["final-final"])).toBe(0);
    expect(finalRevision([FINAL_MARKERS[0]])).toBe(1);
    expect(finalRevision([...FINAL_MARKERS, ...FINAL_MARKERS])).toBe(3);
  });
  it("keeps evasions within their container", () => {
    expect(
      boundedEvasion(
        { left: 80, right: 180, top: 50, bottom: 90 },
        { left: 0, right: 200, top: 0, bottom: 100 },
        0,
        0,
        70,
        40,
      ),
    ).toEqual({ x: 20, y: 10 });
    expect(
      boundedEvasion(
        { left: 0, right: 100, top: 0, bottom: 40 },
        { left: 0, right: 200, top: 0, bottom: 100 },
        20,
        10,
        -70,
        -40,
      ),
    ).toEqual({ x: 20, y: 10 });
  });
  it("changes Terminal jokes only when context warrants it", () => {
    expect(terminalSecretResponse("whoami", false, true)).toContain(
      "DO NOT PRESS",
    );
    expect(terminalSecretResponse("whoami", false, false)).not.toContain(
      "DO NOT PRESS",
    );
    expect(terminalSecretResponse("sudo contain", true, false)).toBe(
      "containment process not responding",
    );
    expect(terminalSecretResponse("help", false, false)).toBeNull();
  });
});
