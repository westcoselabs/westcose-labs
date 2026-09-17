import type { FightClubDefinition } from "./types";

export const fightClubRegistry = [
  {
    id: "fightclub",
    title: "FightClub",
    route: "/games/fightclub",
    buildStatus: "playable",
    artwork: {
      src: "/images/projects/fightclub-concept-cover.webp",
      alt: "Concept cover art of a worn boxing glove inside a graphite arcade cabinet",
    },
    hostedBuild: {
      allowedOrigin: "https://rosy-oak-905.higgsfield.gg",
      buildLabel: "2026-06-29-mobile-ui-layout-fix-1",
      embedStatus: "verified",
      embedUrl: "https://rosy-oak-905.higgsfield.gg/?__raw=1",
      embedVerifiedAt: "2026-08-06",
      launchUrl: "https://rosy-oak-905.higgsfield.gg/",
      messageContract: "none",
      provider: "Higgsfield",
    },
    controls: {
      desktopPlayerOne:
        "A/D move, W jump, S crouch, F punch, G kick, R block, V super",
      desktopPlayerTwo:
        "Arrow keys move, jump, and crouch; K punch, L kick, semicolon block, apostrophe super",
      pocket: "On-screen movement and action controls appear on touch devices.",
    },
    modes: [
      "Arcade against CPU",
      "Local versus on a shared keyboard",
      "Training with infinite meter",
      "Private online one-on-one with invite links",
    ],
    discoveryIds: ["fightclub.uninstall-attempt"],
    achievementIds: [
      "fightclub.first-launch",
      "fightclub.three-launches",
      "fightclub.fullscreen",
      "fightclub.returned-to-os",
    ],
  },
] as const satisfies readonly FightClubDefinition[];

export type RegisteredFightClub = (typeof fightClubRegistry)[number];

export function getFightClub(id: string): RegisteredFightClub | undefined {
  return fightClubRegistry.find((game) => game.id === id);
}
