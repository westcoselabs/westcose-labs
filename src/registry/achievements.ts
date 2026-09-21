import type { AchievementDefinition } from "./types";

// Local games report verified gameplay events. FightClub is hosted and only
// reports OS-observable launcher actions, never unverified remote game state.
export const achievementRegistry = [
  { id: "shitbird.first-flight", title: "Unlicensed pilot", description: "Begin your first SHITBIRD flight.", category: "games", hidden: false },
  { id: "shitbird.first-death", title: "Direct collision with feedback", description: "Complete a flight. Badly.", category: "games", hidden: false },
  { id: "shitbird.zero", title: "Failed the onboarding", description: "Hit something within three seconds, without scoring.", category: "games", hidden: true },
  { id: "shitbird.ten", title: "Local nuisance", description: "Clear 10 obstacles in one flight.", category: "games", hidden: false },
  { id: "shitbird.twenty-five", title: "Coastal management", description: "Clear 25 obstacles in one flight.", category: "games", hidden: false },
  { id: "shitbird.max", title: "Peak bullshit", description: "Reach 40. The coast gets no worse from here.", category: "games", hidden: false, discoveryId: "games.shitbird-cap" },
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
