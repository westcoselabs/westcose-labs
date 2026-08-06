export type PocketNotification = {
  id: string;
  appLabel: string;
  title: string;
  body: string;
};

export const pocketNotifications = [
  {
    id: "build-status",
    appLabel: "Labs Status",
    title: "System ready",
    body: "Portfolio routes are online. Experimental projects remain clearly labeled.",
  },
  {
    id: "readme",
    appLabel: "Notes",
    title: "First time here?",
    body: "Unlock to explore, or choose Normal View for conventional navigation.",
  },
] as const satisfies readonly PocketNotification[];
