"use client";

import {
  Bell,
  CaretRight,
  ComputerTower,
  Eye,
  GearSix,
  MagnifyingGlass,
  PaintBrush,
  Recycle,
  SpeakerHigh,
  Sparkle,
  Target,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import type {
  FocusMode,
  SystemPersonality,
} from "@/state/preferences";

import type { SettingsController } from "../useSettingsController";
import styles from "./DesktopSettings.module.css";

const iconMap = {
  appearance: PaintBrush,
  accessibility: Eye,
  sounds: SpeakerHigh,
  personality: Sparkle,
  discoveries: Bell,
  focus: Target,
  recycle: Recycle,
  system: GearSix,
} as const;

function Toggle({
  checked,
  label,
  onChange,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <input checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} type="checkbox" />
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </label>
  );
}

function SettingCard({
  children,
  description,
  title,
}: {
  readonly children: ReactNode;
  readonly description: string;
  readonly title: string;
}) {
  return (
    <section className={styles.card}>
      <header><h2>{title}</h2><p>{description}</p></header>
      <div>{children}</div>
    </section>
  );
}

const confirmAction = (message: string, action: () => void) => {
  if (window.confirm(message)) action();
};

function DiscoveryCards({ controller }: { readonly controller: SettingsController }) {
  return (
    <div className={styles.discoveryGrid}>
      {controller.discoveryGroups.map((group) => (
        <section key={group.id}>
          <h2>{group.label}</h2>
          {group.items.map((item) => (
            <article data-discovered={item.discovered || undefined} key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

function CategoryCanvas({ controller }: { readonly controller: SettingsController }) {
  const categoryId =
    controller.view.kind === "category" ? controller.view.categoryId : "system";
  const { dispatch, preferences } = controller;

  if (categoryId === "appearance") {
    return (
      <div className={styles.cardGrid}>
        <SettingCard title="Current theme" description="Shared across Desktop and Pocket.">
          <label className={styles.selectControl}><span>Theme</span><select aria-label="Theme" onChange={(event) => dispatch({ type: "theme/set", themeId: event.currentTarget.value })} value={preferences.themeId}>{controller.availableThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}</select></label>
        </SettingCard>
        <SettingCard title="Current wallpaper" description="The bundled Dusk Cliffs artwork."><div className={styles.wallpaperSwatch}><span>Dusk Cliffs</span></div></SettingCard>
        <SettingCard title="Icon lighting" description="A restrained edge highlight on app tiles."><Toggle checked={preferences.iconLighting} label="Icon lighting" onChange={(enabled) => dispatch({ type: "icon-lighting/set", enabled })} /></SettingCard>
        <SettingCard title="High contrast" description="Flattens depth and reinforces boundaries."><Toggle checked={preferences.highContrast} label="High contrast" onChange={(enabled) => dispatch({ type: "high-contrast/set", enabled })} /></SettingCard>
      </div>
    );
  }

  if (categoryId === "sounds") {
    return <div className={styles.cardGrid}>
      <SettingCard title="System sound" description="Opt-in feedback. Nothing autoplays."><Toggle checked={preferences.soundEnabled} label="System sounds" onChange={(enabled) => dispatch({ type: "sound/set", enabled })} /></SettingCard>
      <SettingCard title="Reduced motion" description={controller.effectiveAccessibility.reducedMotion ? "Reduced motion is effective." : "Short transitions are active."}><Toggle checked={preferences.extraReducedMotion} label="Extra reduction" onChange={(enabled) => dispatch({ type: "reduced-motion/set", enabled })} /></SettingCard>
      <SettingCard title="Screensaver" description="A local visual pause state."><Toggle checked={preferences.screensaverEnabled} label="Screensaver" onChange={(enabled) => dispatch({ type: "screensaver/set", enabled })} /></SettingCard>
      <SettingCard title="Notification effects" description="Small motion for local discovery notices."><Toggle checked={preferences.notificationEffects} label="Notification effects" onChange={(enabled) => dispatch({ type: "notification-effects/set", enabled })} /></SettingCard>
    </div>;
  }

  if (categoryId === "accessibility") {
    return <div className={styles.stack}>
      <SettingCard title="Accessible presentation" description="These preferences remain authoritative across every route.">
        <div className={styles.desktopRows}>
          <Toggle checked={preferences.extraReducedMotion} label="Extra reduced motion" onChange={(enabled) => dispatch({ type: "reduced-motion/set", enabled })} />
          <Toggle checked={preferences.highContrast} label="High contrast" onChange={(enabled) => dispatch({ type: "high-contrast/set", enabled })} />
          <label className={styles.selectControl}><span>Preferred presentation</span><select aria-label="Preferred presentation" onChange={(event) => dispatch({ type: "display-preference/set", preference: event.currentTarget.value as "auto" | "desktop" | "pocket" })} value={preferences.displayPreference}><option value="auto">Automatic</option><option value="desktop">Desktop OS</option><option value="pocket">Pocket OS</option></select></label>
        </div>
      </SettingCard>
      <p className={styles.authority}>Browser and operating-system reduced-motion or forced-color preferences always take precedence.</p>
    </div>;
  }

  if (categoryId === "personality") {
    return <div className={styles.stack}>
      <SettingCard title="System personality" description="Adjust the amount of local system character without changing content.">
        <div className={styles.desktopRows}>
          <label className={styles.selectControl}><span>Personality</span><select aria-label="System personality" onChange={(event) => dispatch({ type: "system-personality/set", personality: event.currentTarget.value as SystemPersonality })} value={preferences.systemPersonality}><option value="balanced">Balanced</option><option value="quiet">Quiet</option><option value="playful">Playful</option></select></label>
          <Toggle checked={preferences.discoveryNotifications} label="Discovery notifications" onChange={(enabled) => dispatch({ type: "discovery-notifications/set", enabled })} />
          <Toggle checked={preferences.appBadges} label="App badges" onChange={(enabled) => dispatch({ type: "app-badges/set", enabled })} />
        </div>
      </SettingCard>
      <SettingCard title="Tolerance for bad ideas" description="Maximum tolerance has local consequences and remains reversible.">
        <label className={styles.tolerance}><span>Low</span><input aria-label="Tolerance for bad ideas" max="100" min="0" onChange={(event) => controller.setTolerance(Number(event.currentTarget.value))} type="range" value={preferences.badIdeaTolerance} /><span>High</span><output>{preferences.badIdeaTolerance}%</output></label>
      </SettingCard>
    </div>;
  }

  if (categoryId === "focus") {
    const modes: readonly [FocusMode, string, string][] = [
      ["build", "Build Mode", "Routes, code, and shipping."],
      ["design", "Design Mode", "Visual systems and interface detail."],
      ["arcade", "Arcade Mode", "Games and experiments."],
      ["client-feedback", "Client Feedback Mode", "Translate revisions into concrete decisions."],
      ["pretending-to-work", "Pretending to Work", "A highly legible decoy state."],
    ];
    return <div className={styles.focusGrid}>{modes.map(([id, label, detail]) => <label data-selected={preferences.focusMode === id || undefined} key={id}><input checked={preferences.focusMode === id} name="desktop-focus" onChange={() => controller.setFocusMode(id)} type="radio" /><span><strong>{label}</strong><small>{detail}</small></span></label>)}</div>;
  }

  if (categoryId === "recycle") {
    return <div className={styles.stack}>
      <SettingCard title="Recycle behavior" description="Discarded local work stays recoverable unless explicitly removed.">
        <div className={styles.desktopRows}>
          <Toggle checked={preferences.showDiscardedExperiments} label="Show discarded experiments" onChange={(enabled) => dispatch({ type: "show-discarded-experiments/set", enabled })} />
          <Toggle checked={preferences.autoDeleteGenericConcepts} label="Auto-delete generic concepts" onChange={(enabled) => dispatch({ type: "auto-delete-generic-concepts/set", enabled })} />
          <Toggle checked={preferences.recycleSound} label="Recycle sound" onChange={(enabled) => dispatch({ type: "recycle-sound/set", enabled })} />
        </div>
      </SettingCard>
      <Link className={styles.openRoute} href="/recycle">Open Recycle <CaretRight aria-hidden="true" /></Link>
    </div>;
  }

  if (categoryId === "discoveries") return <DiscoveryCards controller={controller} />;

  return <div className={styles.stack}>
    <section className={styles.systemSummary}>
      <span><ComputerTower aria-hidden="true" weight="fill" /></span>
      <div><h2>WestCose Labs Workstation</h2><p>WestCose Labs OS v3</p><p>Operator: Brandon</p></div>
      <dl><div><dt>Build Status</dt><dd>Stable Enough</dd></div><div><dt>Processes</dt><dd>One hidden process</dd></div><div><dt>Discoveries</dt><dd>{controller.discoveredCount} found</dd></div></dl>
    </section>
    <SettingCard title="System" description="Updates and local startup controls.">
      <div className={styles.desktopRows}>
        <Toggle checked={preferences.automaticUpdates} label="Automatic Updates" onChange={(enabled) => dispatch({ type: "automatic-updates/set", enabled })} />
        <button onClick={controller.systemActions.replayStartup} type="button">Replay startup</button>
        <button onClick={controller.systemActions.previewLock} type="button">Preview lock screen</button>
      </div>
    </SettingCard>
    <SettingCard title="Storage and reset tools" description="Every destructive local reset asks for confirmation.">
      <div className={styles.resetGrid}>
        <button onClick={() => confirmAction("Reset preferences to their defaults?", controller.systemActions.resetPreferences)} type="button">Reset Preferences</button>
        <button onClick={() => confirmAction("Reset the Pocket session and home screen?", controller.systemActions.resetSession)} type="button">Reset Session</button>
        <button onClick={() => confirmAction("Clear every local note and curated-note override?", controller.systemActions.resetLocalNotes)} type="button">Clear Local Notes</button>
        <button onClick={() => confirmAction("Reset discoveries and unlocked themes?", controller.systemActions.resetDiscoveries)} type="button">Reset Discoveries</button>
        <button className={styles.danger} onClick={() => confirmAction("Reset preferences, session, local notes, and discoveries on this device?", controller.systemActions.resetAllLocalState)} type="button">Reset All Local State</button>
      </div>
    </SettingCard>
  </div>;
}

export function DesktopSettings({
  controller,
}: {
  readonly controller: SettingsController;
}) {
  const [search, setSearch] = useState("");
  const activeId = controller.view.kind === "category" ? controller.view.categoryId : "system";
  const activeCategory = controller.categories.find((category) => category.id === activeId);
  const visibleCategories = useMemo(
    () => controller.categories.filter((category) => `${category.label} ${category.description}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())),
    [controller.categories, search],
  );

  return (
    <div className={styles.app} data-app-presenter="desktop-settings" data-route-content>
      <header className={styles.topbar}>
        <div><GearSix aria-hidden="true" weight="fill" /><h1 tabIndex={-1}>Settings</h1></div>
        <label><MagnifyingGlass aria-hidden="true" /><span className="sr-only">Search settings</span><input onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search settings" type="search" value={search} /></label>
      </header>
      {controller.notification && controller.preferences.discoveryNotifications ? (
        <aside className={styles.notification} role="status"><span><strong>{controller.notification.title}</strong>{controller.notification.copy}</span><button aria-label="Dismiss discovery" onClick={controller.dismissNotification} type="button"><X aria-hidden="true" /></button></aside>
      ) : null}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section className={styles.miniDevice}><ComputerTower aria-hidden="true" /><span><strong>WestCose Labs Workstation</strong><small>Local device</small></span></section>
          <nav aria-label="Settings categories"><ul>{visibleCategories.map((category) => { const Icon = iconMap[category.id]; return <li key={category.id}><button aria-current={activeId === category.id ? "page" : undefined} onClick={() => controller.openCategory(category.id)} type="button"><Icon aria-hidden="true" /><span>{category.label}</span></button></li>; })}</ul></nav>
        </aside>
        <main className={styles.canvas}>
          <header className={styles.canvasHeader}><p>Settings / {activeCategory?.label ?? "System"}</p><h2>{activeCategory?.label ?? "System"}</h2><span>{activeCategory?.description}</span></header>
          <CategoryCanvas controller={controller} />
        </main>
      </div>
    </div>
  );
}
