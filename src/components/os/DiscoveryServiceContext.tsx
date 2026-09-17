"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { DiscoveryService } from "@/lib/discovery-service";

const DiscoveryServiceContext = createContext<DiscoveryService | null>(null);

export function DiscoveryServiceProvider({
  children,
  service,
}: {
  readonly children: ReactNode;
  readonly service: DiscoveryService;
}) {
  return (
    <DiscoveryServiceContext.Provider value={service}>
      {children}
    </DiscoveryServiceContext.Provider>
  );
}

export function useDiscoveryService(): DiscoveryService | null {
  return useContext(DiscoveryServiceContext);
}

export function useDiscoveryState() {
  const service = useDiscoveryService();
  return useSyncExternalStore(
    service?.subscribe ?? (() => () => undefined),
    service?.getState ?? (() => null),
    service?.getState ?? (() => null),
  );
}
