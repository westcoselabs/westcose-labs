import type { TerminalCommandDefinition } from "./types";

export const terminalCommandRegistry = [
  {
    id: "egg.remove-scope",
    command: "sudo rm scope-creep",
    description: "Request a change of ownership.",
    hidden: true,
  },
  {
    id: "egg.client-feedback",
    command: "sudo fix-client-feedback",
    description: "Validate a design specification.",
    hidden: true,
  },
  {
    id: "egg.quarantine",
    command: "open quarantine",
    description: "Request access to the quarantined archive.",
    hidden: true,
  },
  {
    id: "egg.contain",
    command: "sudo contain",
    description: "Ask containment nicely.",
    hidden: true,
  },
  {
    id: "egg.identity",
    command: "whoami",
    description: "Inspect the current operator.",
    hidden: true,
  },
  {
    id: "egg.update",
    command: "sudo update",
    description: "Install one entirely fictional change.",
    hidden: true,
  },
  {
    id: "navigate.about",
    command: "about",
    description: "Open the About route.",
    hidden: false,
    route: "/about",
  },
  {
    id: "navigate.contact",
    command: "contact",
    description: "Open the Contact route.",
    hidden: false,
    route: "/contact",
  },
  {
    id: "navigate.experiments",
    command: "experiments",
    description: "Open the Experiments route.",
    hidden: false,
    route: "/experiments",
  },
  {
    id: "navigate.games",
    command: "games",
    description: "Open the Games route.",
    hidden: false,
    route: "/games",
  },
  {
    id: "navigate.github",
    command: "github",
    description: "Open the GitHub directory route.",
    hidden: false,
    route: "/github",
  },
  {
    id: "navigate.projects",
    command: "projects",
    description: "Open the Projects route.",
    hidden: false,
    route: "/projects",
  },
  {
    id: "navigate.services",
    command: "services",
    description: "Open the Services route.",
    hidden: false,
    route: "/services",
  },
  {
    id: "navigate.fightclub",
    command: "open fightclub",
    description: "Open the local FightClub launcher route.",
    hidden: false,
    route: "/games/fightclub",
  },
  {
    id: "utility.help",
    command: "help",
    description: "List the local terminal commands.",
    hidden: false,
  },
  {
    id: "utility.history",
    command: "history",
    description: "Show commands entered in the current terminal session.",
    hidden: false,
  },
  {
    id: "utility.theme",
    command: "theme",
    description: "Report the active local theme.",
    hidden: false,
  },
  {
    id: "utility.clear",
    command: "clear",
    description: "Clear the current terminal output.",
    hidden: false,
  },
  {
    id: "secret.westcose",
    command: "secret",
    aliases: ["westcose"],
    description: "Reveal the harmless hidden terminal response.",
    hidden: true,
    discoveryId: "terminal.secret-command",
  },
  {
    id: "secret.impress-client",
    command: "sudo impress-client",
    description: "Return the terminal's harmless permission-denied joke.",
    hidden: true,
  },
] as const satisfies readonly TerminalCommandDefinition[];

export type RegisteredTerminalCommand =
  (typeof terminalCommandRegistry)[number];

export function getTerminalCommand(
  command: string,
): RegisteredTerminalCommand | undefined {
  const normalized = command.trim().toLowerCase();
  return terminalCommandRegistry.find(
    (definition) =>
      definition.command === normalized ||
      ("aliases" in definition &&
        (definition.aliases as readonly string[]).includes(normalized)),
  );
}
