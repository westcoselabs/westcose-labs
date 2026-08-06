import { describe, expect, it } from "vitest";

import {
  createInitialPreferences,
  preferencesReducer,
  resolveEffectiveAccessibility,
} from "../../src/state/preferences";

describe("preferences", () => {
  it("uses Dusk, sound off, automatic display, and no added effects by default", () => {
    expect(createInitialPreferences()).toEqual({
      themeId: "dusk",
      soundEnabled: false,
      extraReducedMotion: false,
      highContrast: false,
      displayPreference: "auto",
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
});

