export const DUSK_THEME_ID = "dusk" as const;

export type DisplayPreference = "auto" | "desktop" | "pocket" | "normal";

export interface Preferences {
  readonly themeId: typeof DUSK_THEME_ID;
  readonly soundEnabled: boolean;
  readonly extraReducedMotion: boolean;
  readonly highContrast: boolean;
  readonly displayPreference: DisplayPreference;
}

export interface SystemAccessibilityPreferences {
  readonly reducedMotion: boolean;
  readonly highContrast?: boolean;
  readonly forcedColors?: boolean;
}

export interface EffectiveAccessibilityPreferences {
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

export type PreferencesAction =
  | { readonly type: "hydrate"; readonly preferences: Preferences }
  | { readonly type: "sound/set"; readonly enabled: boolean }
  | { readonly type: "reduced-motion/set"; readonly enabled: boolean }
  | { readonly type: "high-contrast/set"; readonly enabled: boolean }
  | {
      readonly type: "display-preference/set";
      readonly preference: DisplayPreference;
    }
  | { readonly type: "reset" };

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  themeId: DUSK_THEME_ID,
  soundEnabled: false,
  extraReducedMotion: false,
  highContrast: false,
  displayPreference: "auto",
});

export const createInitialPreferences = (): Preferences => ({
  ...DEFAULT_PREFERENCES,
});

export function preferencesReducer(
  state: Preferences,
  action: PreferencesAction,
): Preferences {
  switch (action.type) {
    case "hydrate":
      return { ...action.preferences, themeId: DUSK_THEME_ID };
    case "sound/set":
      return { ...state, soundEnabled: action.enabled };
    case "reduced-motion/set":
      return { ...state, extraReducedMotion: action.enabled };
    case "high-contrast/set":
      return { ...state, highContrast: action.enabled };
    case "display-preference/set":
      return { ...state, displayPreference: action.preference };
    case "reset":
      return createInitialPreferences();
  }
}

export function resolveEffectiveAccessibility(
  preferences: Preferences,
  system: SystemAccessibilityPreferences,
): EffectiveAccessibilityPreferences {
  return {
    reducedMotion: system.reducedMotion || preferences.extraReducedMotion,
    highContrast:
      preferences.highContrast ||
      system.highContrast === true ||
      system.forcedColors === true,
  };
}
