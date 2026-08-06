import type { ReactNode } from "react";

export type PocketPageIndex = 0 | 1;

export interface PocketAppItem {
  readonly accessibilityLabel: string;
  readonly description?: string;
  readonly iconKey: string;
  readonly id: string;
  readonly kind?: "app" | "social";
  readonly label: string;
  readonly statusLabel?: string;
  readonly verified?: boolean;
}

export interface PocketNotificationItem {
  readonly appLabel: string;
  readonly body: string;
  readonly id: string;
  readonly title: string;
}

export interface FeaturedProjectItem {
  readonly appId: string;
  readonly description: string;
  readonly title: string;
}

export interface LabsStatusItem {
  readonly detail: string;
  readonly label: string;
}

export interface PocketAppFrameDescriptor {
  readonly backLabel?: string;
  readonly title: string;
}

export interface PocketShellProps {
  readonly activeApp?: PocketAppFrameDescriptor;
  readonly children?: ReactNode;
  readonly dismissedNotificationIds?: readonly string[];
  readonly dockApps: readonly PocketAppItem[];
  readonly featuredProject: FeaturedProjectItem;
  readonly labsStatus: LabsStatusItem;
  readonly menuTargetId?: string | null;
  readonly normalViewHref?: string;
  readonly notifications: readonly PocketNotificationItem[];
  readonly onBack: () => void;
  readonly onCloseAppMenu: () => void;
  readonly onDismissNotification: (notificationId: string) => void;
  readonly onLaunchApp: (app: PocketAppItem) => void;
  readonly onOpenAppMenu: (app: PocketAppItem) => void;
  readonly onPageChange: (page: PocketPageIndex) => void;
  readonly onStartupComplete: () => void;
  readonly onUnlock: () => void;
  readonly page: PocketPageIndex;
  readonly pageOneApps: readonly PocketAppItem[];
  readonly pageTwoApps: readonly PocketAppItem[];
  readonly pathname: string;
  readonly reducedMotion?: boolean;
  readonly startupPlayed: boolean;
  readonly unlocked: boolean;
  readonly wallpaperUrl?: string;
}
