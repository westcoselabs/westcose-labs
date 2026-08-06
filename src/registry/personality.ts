export const personalityRegistry = {
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
    labsStatus: "Diagnostic result: confidence exceeds available evidence.",
    fightclubUninstall: "FightClub cannot be removed while it is running. FightClub is always running.",
    recycleRestore: "Restored. The idea remains questionable.",
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
