"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Shell } from "@/lib/shell-selection";

const ShellPresentationContext = createContext<Shell>("normal");

export function ShellPresentationProvider({
  children,
  shell,
}: {
  readonly children: ReactNode;
  readonly shell: Shell;
}) {
  return (
    <ShellPresentationContext.Provider value={shell}>
      {children}
    </ShellPresentationContext.Provider>
  );
}

export function useShellPresentation(): Shell {
  return useContext(ShellPresentationContext);
}
