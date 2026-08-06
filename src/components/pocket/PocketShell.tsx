"use client";

import type { CSSProperties } from "react";
import { useMemo, useRef } from "react";

import { useVisualViewport } from "@/hooks/useVisualViewport";

import { PocketAppFrame } from "./PocketAppFrame";
import { PocketHome } from "./PocketHome";
import { PocketLockScreen } from "./PocketLockScreen";
import styles from "./PocketShell.module.css";
import { PocketStartup } from "./PocketStartup";
import type { PocketShellProps } from "./types";

function isRootPath(pathname: string) {
  const cleanPath = pathname.split(/[?#]/u, 1)[0]?.replace(/\/+$/u, "") ?? "";
  return cleanPath === "" || cleanPath === "/";
}

export function PocketShell({
  activeApp,
  children,
  dismissedNotificationIds = [],
  dockApps,
  featuredProject,
  labsStatus,
  menuTargetId,
  normalViewHref,
  notifications,
  onBack,
  onCloseAppMenu,
  onDismissNotification,
  onLaunchApp,
  onOpenAppMenu,
  onPageChange,
  onStartupComplete,
  onUnlock,
  page,
  pageOneApps,
  pageTwoApps,
  pathname,
  reducedMotion = false,
  startupPlayed,
  unlocked,
  wallpaperUrl,
}: PocketShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  useVisualViewport(shellRef);
  const atRoot = isRootPath(pathname);
  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !dismissedNotificationIds.includes(notification.id),
      ),
    [dismissedNotificationIds, notifications],
  );
  const wallpaperStyle = wallpaperUrl
    ? ({
        "--pocket-wallpaper-image": `url("${wallpaperUrl}")`,
      } as CSSProperties)
    : undefined;

  let content;
  if (!atRoot || activeApp) {
    content = (
      <PocketAppFrame
        backLabel={activeApp?.backLabel}
        normalViewHref={normalViewHref}
        onBack={onBack}
        title={activeApp?.title ?? "WestCose Labs"}
      >
        {children}
      </PocketAppFrame>
    );
  } else if (!startupPlayed) {
    content = (
      <PocketStartup
        normalViewHref={normalViewHref}
        onComplete={onStartupComplete}
        reducedMotion={reducedMotion}
      />
    );
  } else if (!unlocked) {
    content = (
      <PocketLockScreen
        normalViewHref={normalViewHref}
        notifications={visibleNotifications}
        onDismissNotification={onDismissNotification}
        onUnlock={onUnlock}
      />
    );
  } else {
    content = (
      <PocketHome
        dockApps={dockApps}
        featuredProject={featuredProject}
        labsStatus={labsStatus}
        menuTargetId={menuTargetId}
        normalViewHref={normalViewHref}
        onCloseAppMenu={onCloseAppMenu}
        onLaunchApp={onLaunchApp}
        onOpenAppMenu={onOpenAppMenu}
        onPageChange={onPageChange}
        page={page}
        pageOneApps={pageOneApps}
        pageTwoApps={pageTwoApps}
        reducedMotion={reducedMotion}
      />
    );
  }

  return (
    <div
      className={styles.shell}
      data-reduced-motion={reducedMotion || undefined}
      ref={shellRef}
      style={wallpaperStyle}
    >
      {content}
    </div>
  );
}
