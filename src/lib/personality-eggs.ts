export const FINAL_FILES = [
  "final-final-v7-actually-final.fig",
  "final-final-v8-client-really-final.fig",
  "final-final-v9-FINAL.fig",
  "final-final-v10-FINAL-final-use-this-one.fig",
] as const;

// These markers use the existing discovery save, not a second persistence store.
export const FINAL_MARKERS = [
  "egg.final-final.v8",
  "egg.final-final.v9",
  "egg.final-final.v10",
] as const;
export function finalRevision(restorations: readonly string[] = []) {
  return FINAL_MARKERS.reduce(
    (stage, marker, index) =>
      restorations.includes(marker) ? index + 1 : stage,
    0,
  );
}

export const OUTBREAK_ALERTS = [
  {
    title: "SECURITY NOTICE",
    body: "You just raw-dogged an unknown ZIP file.",
  },
  { title: "QUARANTINE FAILURE", body: "Nice. That’s on you." },
  { title: "SYSTEM STATUS", body: "IT has left the building." },
  { title: "THREAT DETECTED", body: "One of them knows your browser history." },
  {
    title: "WESTCOSE DEFENDER",
    body: "Good news: not a virus. Bad news: they’re unionizing under the taskbar.",
  },
  { title: "SECURITY LEVEL", body: "Fucking around → finding out." },
  { title: "IMPORTANT", body: "Do not feed the little bastard." },
] as const;

export function chooseOutbreakAlerts(random = Math.random): number[] {
  const ids = OUTBREAK_ALERTS.map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 3 + Math.floor(random() * 4));
}

export type EggPanelKind = "weekend" | "meeting" | "update";
export const EGG_PANEL_TITLES: Record<EggPanelKind, string> = {
  weekend: "WestCose Process Monitor",
  meeting: "Quick sync",
  update: "WestCose OS Update",
};
export const PROCESS_PROGRESS = [99, 98, 99, 83, 99];
export const UPDATE_PROGRESS = [3, 17, 84, 97, 31, 99, 99, 99];
export const MEETING_LINES = [
  "5 joined",
  "Can everyone see my screen?",
  "You’re muted.",
  "Sorry, go ahead.",
  "No, you go ahead.",
  "We can circle back.",
  "This could have been a README.",
  "Everyone left.",
  "Meeting ended.",
];

export function terminalSecretResponse(
  command: string,
  active: boolean,
  discovered: boolean,
): string | null {
  switch (command) {
    case "sudo rm scope-creep":
      return "permission denied\nscope-creep owns this machine";
    case "sudo fix-client-feedback":
      return "error:\n“make it pop” is not a valid design specification";
    case "sudo contain":
      return active
        ? "containment process not responding"
        : "Nothing to contain. Suspicious.";
    case "whoami":
      return discovered
        ? "someone who keeps clicking things clearly marked DO NOT PRESS"
        : "guest\nUnsupervised, apparently.";
    default:
      return null;
  }
}
