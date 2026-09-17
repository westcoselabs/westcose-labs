import { getDiscovery } from "./discoveries";
import type { Discovery } from "./types";

function discoveryCopy(id: string): string {
  const discovery: Discovery | undefined = getDiscovery(id);
  if (!discovery) {
    throw new Error(`Unknown discovery copy requested by humor registry: ${id}`);
  }
  return discovery.notificationCopy ?? discovery.description;
}

export const humorRegistry = {
  conditionMessages: [
    "High pressure from revisions",
    "Visibility reduced by scope creep",
    "Creative conditions: questionable",
    "One process is refusing to close",
    "Side-project capacity exceeded",
  ],
  statusMessages: [
    "Build stable enough",
    "Routes online",
    "No critical bugs found nearby",
  ],
  loadingMessages: [
    "Checking routes and unfinished business",
    "Re-indexing questionable ideas",
  ],
  emptyStates: [
    "Nothing published here yet. The route still works.",
    "No verified destination is available.",
  ],
  discoveries: {
    labsStatus: discoveryCopy("desktop.labs-status"),
    fightclubUninstall: discoveryCopy("fightclub.uninstall-attempt"),
    recycleRestore: discoveryCopy("recycle.first-restoration"),
  },
  recycleFiles: [
    {
      id: "final-final",
      name: "final-final-v7-actually-final.fig",
      note: "Modified continuously since the phrase quick revision.",
    },
    {
      id: "weekend-project",
      name: "weekend-project-437-days-running.log",
      note: "Background task healthy. Definition of healthy unavailable.",
    },
    {
      id: "readme-meeting",
      name: "meeting-that-could-have-been-a-readme.txt",
      note: "Recovered successfully. It is now a README.",
    },
  ],
} as const;
