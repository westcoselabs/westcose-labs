export const DUSK_THEME_ID = "dusk" as const;

export type DisplayPreference = "auto" | "desktop" | "pocket";
export type FocusMode =
  | "build"
  | "design"
  | "arcade"
  | "client-feedback"
  | "pretending-to-work";
export type SystemPersonality = "balanced" | "quiet" | "playful";

export interface Preferences {
  readonly themeId: string;
  readonly wallpaperId: string;
  readonly soundEnabled: boolean;
  readonly extraReducedMotion: boolean;
  readonly highContrast: boolean;
  readonly displayPreference: DisplayPreference;
  readonly iconLighting: boolean;
  readonly screensaverEnabled: boolean;
  readonly notificationEffects: boolean;
  readonly systemPersonality: SystemPersonality;
  readonly discoveryNotifications: boolean;
  readonly appBadges: boolean;
  readonly badIdeaTolerance: number;
  readonly focusMode: FocusMode;
  readonly showDiscardedExperiments: boolean;
  readonly autoDeleteGenericConcepts: boolean;
  readonly recycleSound: boolean;
  readonly automaticUpdates: boolean;
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
  | { readonly type: "theme/set"; readonly themeId: string }
  | { readonly type: "wallpaper/set"; readonly wallpaperId: string }
  | { readonly type: "sound/set"; readonly enabled: boolean }
  | { readonly type: "reduced-motion/set"; readonly enabled: boolean }
  | { readonly type: "high-contrast/set"; readonly enabled: boolean }
  | { readonly type: "icon-lighting/set"; readonly enabled: boolean }
  | { readonly type: "screensaver/set"; readonly enabled: boolean }
  | { readonly type: "notification-effects/set"; readonly enabled: boolean }
  | {
      readonly type: "system-personality/set";
      readonly personality: SystemPersonality;
    }
  | { readonly type: "discovery-notifications/set"; readonly enabled: boolean }
  | { readonly type: "app-badges/set"; readonly enabled: boolean }
  | { readonly type: "bad-idea-tolerance/set"; readonly value: number }
  | { readonly type: "focus-mode/set"; readonly focusMode: FocusMode }
  | { readonly type: "show-discarded-experiments/set"; readonly enabled: boolean }
  | { readonly type: "auto-delete-generic-concepts/set"; readonly enabled: boolean }
  | { readonly type: "recycle-sound/set"; readonly enabled: boolean }
  | { readonly type: "automatic-updates/set"; readonly enabled: boolean }
  | {
      readonly type: "display-preference/set";
      readonly preference: DisplayPreference;
    }
  | { readonly type: "reset" };

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  themeId: DUSK_THEME_ID,
  wallpaperId: "dusk-cliffs",
  soundEnabled: false,
  extraReducedMotion: false,
  highContrast: false,
  displayPreference: "auto",
  iconLighting: true,
  screensaverEnabled: false,
  notificationEffects: true,
  systemPersonality: "balanced",
  discoveryNotifications: true,
  appBadges: true,
  badIdeaTolerance: 40,
  focusMode: "build",
  showDiscardedExperiments: true,
  autoDeleteGenericConcepts: false,
  recycleSound: false,
  automaticUpdates: true,
});

export const createInitialPreferences = (): Preferences => ({
  ...DEFAULT_PREFERENCES,
});

const clampTolerance = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

export function preferencesReducer(
  state: Preferences,
  action: PreferencesAction,
): Preferences {
  switch (action.type) {
    case "hydrate":
      return { ...action.preferences };
    case "theme/set":
      return state.themeId === action.themeId
        ? state
        : { ...state, themeId: action.themeId };
    case "wallpaper/set":
      return { ...state, wallpaperId: action.wallpaperId };
    case "sound/set":
      return { ...state, soundEnabled: action.enabled };
    case "reduced-motion/set":
      return { ...state, extraReducedMotion: action.enabled };
    case "high-contrast/set":
      return { ...state, highContrast: action.enabled };
    case "icon-lighting/set":
      return { ...state, iconLighting: action.enabled };
    case "screensaver/set":
      return { ...state, screensaverEnabled: action.enabled };
    case "notification-effects/set":
      return { ...state, notificationEffects: action.enabled };
    case "system-personality/set":
      return { ...state, systemPersonality: action.personality };
    case "discovery-notifications/set":
      return { ...state, discoveryNotifications: action.enabled };
    case "app-badges/set":
      return { ...state, appBadges: action.enabled };
    case "bad-idea-tolerance/set":
      return { ...state, badIdeaTolerance: clampTolerance(action.value) };
    case "focus-mode/set":
      return { ...state, focusMode: action.focusMode };
    case "show-discarded-experiments/set":
      return { ...state, showDiscardedExperiments: action.enabled };
    case "auto-delete-generic-concepts/set":
      return { ...state, autoDeleteGenericConcepts: action.enabled };
    case "recycle-sound/set":
      return { ...state, recycleSound: action.enabled };
    case "automatic-updates/set":
      return { ...state, automaticUpdates: action.enabled };
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
