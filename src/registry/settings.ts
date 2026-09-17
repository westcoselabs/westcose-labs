export type SettingsCategoryId =
  | "appearance"
  | "accessibility"
  | "sounds"
  | "personality"
  | "discoveries"
  | "focus"
  | "recycle"
  | "system";

export type SettingsCategory = {
  readonly description: string;
  readonly id: SettingsCategoryId;
  readonly label: string;
  readonly tone: "amber" | "blue" | "cyan" | "green" | "indigo" | "red" | "silver" | "teal";
};

export const settingsCategoryRegistry = [
  { id: "system", label: "System", description: "Device information, updates, startup, and reset tools.", tone: "silver" },
  { id: "appearance", label: "Appearance", description: "Theme, wallpaper, icon lighting, and contrast.", tone: "indigo" },
  { id: "sounds", label: "Sound & Motion", description: "System sounds, motion, screensaver, and effects.", tone: "cyan" },
  { id: "accessibility", label: "Accessibility", description: "Authoritative motion, contrast, and presentation preferences.", tone: "blue" },
  { id: "focus", label: "Focus", description: "Choose the system mode that matches the current work.", tone: "green" },
  { id: "personality", label: "Personality", description: "Personality, badges, discoveries, and idea tolerance.", tone: "amber" },
  { id: "discoveries", label: "Discoveries", description: "Review found secrets without spoiling hidden ones.", tone: "teal" },
  { id: "recycle", label: "Recycle", description: "Control discarded experiments and questionable ideas.", tone: "red" },
] as const satisfies readonly SettingsCategory[];

export function getSettingsCategory(id: string): SettingsCategory | undefined {
  return settingsCategoryRegistry.find((category) => category.id === id);
}
