import type { AchievementDefinition } from "./types";

// These achievements describe only behavior that WestCose Labs OS can observe.
// The hosted build exposes no verified postMessage contract, so internal game
// state never unlocks an OS achievement.
export const achievementRegistry = [
  {
    id: "fightclub.first-launch",
    title: "First bell",
    description: "Launch the hosted FightClub build from WestCose Labs OS.",
    category: "fightclub",
    hidden: false,
  },
  {
    id: "fightclub.three-launches",
    title: "Back for another round",
    description: "Launch the hosted build three times from this browser.",
    category: "fightclub",
    hidden: false,
  },
  {
    id: "fightclub.fullscreen",
    title: "Main event",
    description: "Enter full screen from the OS-owned player controls.",
    category: "fightclub",
    hidden: false,
  },
  {
    id: "fightclub.returned-to-os",
    title: "Returned to the corner",
    description: "Exit the hosted build and return to the local launcher.",
    category: "fightclub",
    hidden: false,
  },
] as const satisfies readonly AchievementDefinition[];

export function getAchievement(
  id: string,
): AchievementDefinition | undefined {
  return achievementRegistry.find((achievement) => achievement.id === id);
}
