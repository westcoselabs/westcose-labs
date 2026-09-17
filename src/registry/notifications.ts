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
    body: "Unlock to explore. Every destination also remains a real browser route.",
  },
] as const satisfies readonly PocketNotification[];
