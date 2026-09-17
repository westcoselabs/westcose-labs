import type { DisplayPreference } from "../state/preferences";

export type Shell = "desktop" | "pocket" | "normal";
export type ViewQueryOverride = "normal" | "os" | null;

export interface ShellAvailability {
  readonly desktop: boolean;
  readonly pocket: boolean;
  readonly normal?: boolean;
}

export interface ShellSelectionInput {
  readonly view?: string | null;
  readonly storedPreference?: DisplayPreference | null;
  readonly viewportWidth: number;
  readonly coarsePointer: boolean;
  readonly availability?: ShellAvailability;
}

export interface ShellSelection {
  readonly shell: Shell;
  readonly requestedShell: Shell;
  readonly source: "query" | "preference" | "automatic" | "route-fallback";
  readonly routeFallback: boolean;
}

export const NO_JAVASCRIPT_SHELL: Shell = "normal";
export const POCKET_WIDTH_THRESHOLD = 768;
export const COARSE_POINTER_POCKET_WIDTH_THRESHOLD = 1024;

export function parseViewQueryOverride(
  value: string | null | undefined,
): ViewQueryOverride {
  if (value === "normal" || value === "os") {
    return value;
  }

  return null;
}

export function selectAutomaticShell(
  viewportWidth: number,
  coarsePointer: boolean,
): Exclude<Shell, "normal"> {
  const width = Number.isFinite(viewportWidth)
    ? Math.max(0, viewportWidth)
    : Number.POSITIVE_INFINITY;

  return width < POCKET_WIDTH_THRESHOLD ||
    (width < COARSE_POINTER_POCKET_WIDTH_THRESHOLD && coarsePointer)
    ? "pocket"
    : "desktop";
}

const isAvailable = (
  shell: Exclude<Shell, "normal">,
  availability: ShellAvailability | undefined,
): boolean => availability?.[shell] ?? true;

export function resolveShell(input: ShellSelectionInput): ShellSelection {
  const override = parseViewQueryOverride(input.view);
  let requestedShell: Shell;
  let source: ShellSelection["source"];

  if (override === "normal") {
    requestedShell = "normal";
    source = "query";
  } else if (override === "os") {
    requestedShell = selectAutomaticShell(
      input.viewportWidth,
      input.coarsePointer,
    );
    source = "query";
  } else {
    const preference = input.storedPreference ?? "auto";

    if (preference === "desktop" || preference === "pocket") {
      requestedShell = preference;
      source = "preference";
    } else {
      requestedShell = selectAutomaticShell(
        input.viewportWidth,
        input.coarsePointer,
      );
      source = "automatic";
    }
  }

  if (
    requestedShell !== "normal" &&
    !isAvailable(requestedShell, input.availability)
  ) {
    return {
      shell: "normal",
      requestedShell,
      source: "route-fallback",
      routeFallback: true,
    };
  }

  return {
    shell: requestedShell,
    requestedShell,
    source,
    routeFallback: false,
  };
}
