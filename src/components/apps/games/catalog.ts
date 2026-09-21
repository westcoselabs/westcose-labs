import { fightClubRegistry } from "@/registry/fightclub";

/** Local originals belong to Games, not a new top-level OS application. */
export const originalGames = [
  {
    id: "shitbird",
    title: "SHITBIRD",
    href: "/games/shitbird",
    description:
      "One bird. No prospects. A one-button flight through the wrong end of the coast.",
    edition: "WestCose original / No. 001",
    cover: "/games/shitbird/cover.webp",
    alt: "A scruffy gull above a carved teal wave and the West Cose Motel, in a weathered cream and orange surf print.",
  },
  {
    id: "low-tide-loot",
    title: "LOW TIDE LOOT",
    href: "/games/arcade/low-tide-loot",
    description:
      "Make rent before the tide comes back. One rusty claw. Sixty seconds. Finders keepers.",
    edition: "WestCose Arcade / No. 002",
    cover: "/games/low-tide-loot/cover.webp",
    alt: "A skeleton beach scavenger working a homemade salvage crane in a turquoise, cream and yellow surf print.",
  },
] as const;

/** Presentation-only metadata; importing the library never imports an engine. */
export const gamePresentations = [
  {
    ...originalGames[0],
    genre: "One-button arcade",
    color: "orange",
    aspectRatio: "2 / 3",
    kind: "original",
  },
  {
    ...originalGames[1],
    genre: "Beach salvage · Landscape",
    color: "teal",
    aspectRatio: "16 / 9",
    kind: "original",
  },
  {
    id: "fightclub",
    title: fightClubRegistry[0].title,
    href: fightClubRegistry[0].route,
    cover: fightClubRegistry[0].artwork.src,
    alt: fightClubRegistry[0].artwork.alt,
    genre: "Arcade fighter · Hosted",
    color: "red",
    aspectRatio: "16 / 9",
    kind: "hosted",
  },
] as const;
