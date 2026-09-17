import { describe, expect, it } from "vitest";

import {
  createInitialPreferences,
  DEFAULT_PREFERENCES,
  preferencesReducer,
  resolveEffectiveAccessibility,
} from "../../src/state/preferences";

describe("preferences", () => {
  it("uses Dusk, sound off, automatic display, and no added effects by default", () => {
    expect(createInitialPreferences()).toEqual({
      ...DEFAULT_PREFERENCES,
    });
  });

  it("never lets a stored preference override system reduced motion", () => {
    const preferences = preferencesReducer(createInitialPreferences(), {
      type: "reduced-motion/set",
      enabled: false,
    });

    expect(
      resolveEffectiveAccessibility(preferences, { reducedMotion: true }),
    ).toMatchObject({ reducedMotion: true });
  });

  it("allows extra reduced motion when the system does not request it", () => {
    const preferences = preferencesReducer(createInitialPreferences(), {
      type: "reduced-motion/set",
      enabled: true,
    });

    expect(
      resolveEffectiveAccessibility(preferences, { reducedMotion: false }),
    ).toMatchObject({ reducedMotion: true });
  });

  it("preserves a migrated theme and changes themes immutably", () => {
    const initial = createInitialPreferences();
    const hydrated = preferencesReducer(initial, {
      type: "hydrate",
      preferences: { ...DEFAULT_PREFERENCES, themeId: "computer-lab-2008" },
    });
    const changed = preferencesReducer(hydrated, {
      type: "theme/set",
      themeId: "corporate-beige",
    });

    expect(initial.themeId).toBe("dusk");
    expect(hydrated.themeId).toBe("computer-lab-2008");
    expect(changed.themeId).toBe("corporate-beige");
    expect(changed).not.toBe(hydrated);
  });

  it("keeps bad-idea tolerance reversible and inside its valid range", () => {
    const maximum = preferencesReducer(createInitialPreferences(), {
      type: "bad-idea-tolerance/set",
      value: 140,
    });
    const lowered = preferencesReducer(maximum, {
      type: "bad-idea-tolerance/set",
      value: 25,
    });

    expect(maximum.badIdeaTolerance).toBe(100);
    expect(lowered.badIdeaTolerance).toBe(25);
  });
});

