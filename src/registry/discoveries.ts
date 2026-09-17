import type { Discovery } from "./types";

export const discoveryRegistry = [
  {
    id: "desktop.labs-status",
    title: "Labs status diagnostic",
    description: "The Pocket status widget reveals its less-certain diagnostic.",
    category: "desktop",
    hidden: true,
    notificationCopy:
      "Diagnostic result: confidence exceeds available evidence.",
  },
  {
    id: "terminal.secret-command",
    title: "Terminal secret",
    description: "A harmless hidden command was entered in the local terminal.",
    category: "terminal",
    hidden: true,
    notificationCopy:
      "Hidden command found: good software should still work when the costume comes off.",
  },
  {
    id: "recycle.first-restoration",
    title: "Questionable idea restored",
    description: "An item was restored from the Recycle app.",
    category: "recycle",
    hidden: true,
    notificationCopy: "Restored. The idea remains questionable.",
  },
  {
    id: "fightclub.uninstall-attempt",
    title: "FightClub uninstall attempt",
    description: "The harmless Uninstall action was tried from the launcher.",
    category: "fightclub",
    hidden: true,
    notificationCopy:
      "FightClub cannot be removed while it is running. FightClub is always running.",
  },
  {
    id: "notes.hidden-note-opened",
    title: "Hidden note found",
    description: "The note that definitely contains no passwords was opened.",
    category: "notes",
    hidden: true,
    notificationCopy:
      "Hidden note found. It contains good security advice and no credentials.",
  },
  {
    id: "notes.title-mutated",
    title: "A note changed its mind",
    description: "A frequently opened note made its title more emphatic.",
    category: "notes",
    hidden: true,
    notificationCopy:
      "Five opens later, the note would still prefer not to be redesigned.",
  },
  {
    id: "notes.first-compose",
    title: "Local note composed",
    description: "A new editable note was created on this device.",
    category: "notes",
    hidden: true,
  },
  {
    id: "notes.note-recycled",
    title: "Note moved to Recycle",
    description: "A note was soft-deleted and remains recoverable.",
    category: "notes",
    hidden: true,
  },
  {
    id: "notes.note-restored",
    title: "Note restored",
    description: "A recycled note returned to the Notes library.",
    category: "notes",
    hidden: true,
  },
  {
    id: "notes.final-rename-refused",
    title: "Already final",
    description: "Final_FINAL_v8 correctly refused another rename.",
    category: "notes",
    hidden: true,
    notificationCopy: "This file is already final.",
  },
  {
    id: "settings.bad-ideas-max",
    title: "Maximum bad-idea tolerance",
    description: "The workstation accepted the highest available idea tolerance.",
    category: "theme",
    hidden: true,
    notificationCopy:
      "Tolerance maximized. Corporate Beige is now available for consequences.",
  },
] as const satisfies readonly Discovery[];

export type RegisteredDiscovery = (typeof discoveryRegistry)[number];
export type DiscoveryId = RegisteredDiscovery["id"];

export function getDiscovery(id: string): RegisteredDiscovery | undefined {
  return discoveryRegistry.find((discovery) => discovery.id === id);
}
