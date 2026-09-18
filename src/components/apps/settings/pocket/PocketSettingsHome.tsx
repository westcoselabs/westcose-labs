"use client";

import { RecommendedWallpaper } from "@/components/os/RecommendedWallpaper";

import {
  Bell,
  CaretRight,
  DeviceMobile,
  Eye,
  GearSix,
  PaintBrush,
  Recycle,
  SpeakerHigh,
  Sparkle,
  Target,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type {
  FocusMode,
  SystemPersonality,
} from "@/state/preferences";

import type { SettingsController } from "../useSettingsController";
import styles from "./PocketSettings.module.css";

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

function Switch({
  checked,
  label,
  onChange,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.switch}>
      <span className="sr-only">{label}</span>
      <input
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" />
    </label>
  );
}

function SettingRow({
  control,
  detail,
  label,
}: {
  readonly control: ReactNode;
  readonly detail?: string;
  readonly label: string;
}) {
  return (
    <div className={styles.settingRow}>
      <span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span>
      {control}
    </div>
  );
}

const confirmAction = (message: string, action: () => void) => {
  if (window.confirm(message)) action();
};

function DiscoveryNotice({ controller }: { readonly controller: SettingsController }) {
  if (!controller.notification || !controller.preferences.discoveryNotifications) {
    return null;
  }
  return (
    <aside className={styles.discoveryNotice} role="status">
      <span><strong>{controller.notification.title}</strong><small>{controller.notification.copy}</small></span>
      <button aria-label="Dismiss discovery" onClick={controller.dismissNotification} type="button"><X aria-hidden="true" /></button>
    </aside>
  );
}

function SettingsHome({ controller }: { readonly controller: SettingsController }) {
  return (
    <div className={styles.page}>
      <header className={styles.largeHeader}>
        <small>POCKET CONTROL CENTER</small>
        <h1 tabIndex={-1}>Settings</h1>
      </header>
      <section aria-label="Pocket device" className={styles.deviceCard}>
        <span><DeviceMobile aria-hidden="true" weight="fill" /></span>
        <div><strong>WestCose Pocket</strong><small>Pocket OS v3</small><small>Build: Stable Enough</small></div>
      </section>
      <DiscoveryNotice controller={controller} />
      <nav aria-label="Settings categories" className={styles.groups}>
        {[controller.categories.slice(0, 4), controller.categories.slice(4)].map((group, index) => (
          <ul key={index}>
            {group.map((category) => {
              const Icon = iconMap[category.id];
              const value =
                category.id === "appearance"
                  ? controller.availableThemes.find((theme) => theme.id === controller.preferences.themeId)?.name ?? "Dusk"
                  : category.id === "discoveries"
                    ? `${controller.discoveredCount} found`
                    : undefined;
              return (
                <li key={category.id}>
                  <button onClick={() => controller.openCategory(category.id)} type="button">
                    <span className={styles.categoryIcon} data-tone={category.tone}><Icon aria-hidden="true" weight="fill" /></span>
                    <span><strong>{category.label}</strong>{value ? <small>{value}</small> : null}</span>
                    <CaretRight aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </nav>
    </div>
  );
}

function Discoveries({ controller }: { readonly controller: SettingsController }) {
  return (
    <div className={styles.discoveryGroups}>
      {controller.discoveryGroups.map((group) => (
        <section key={group.id}>
          <h2>{group.label}</h2>
          <ul>
            {group.items.map((item) => (
              <li data-discovered={item.discovered || undefined} key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CategoryControls({ controller }: { readonly controller: SettingsController }) {
  const categoryId =
    controller.view.kind === "category" ? controller.view.categoryId : "system";
  const { dispatch, preferences } = controller;

  if (categoryId === "appearance") {
    return (
      <div className={styles.controlGroups}>
        <section>
          <h2>Look and feel</h2>
          <SettingRow
            label="Theme"
            control={
              <select aria-label="Theme" onChange={(event) => controller.setThemeId(event.currentTarget.value)} value={controller.activeThemeId}>
                {controller.availableThemes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
              </select>
            }
          />
          <RecommendedWallpaper />
          <div aria-label="Wallpaper" className={styles.wallpaperList} role="radiogroup">
            {controller.availableWallpapers.map((wallpaper) => (
              <button
                aria-checked={wallpaper.id === controller.activeWallpaperId}
                key={wallpaper.id}
                onClick={() => controller.setWallpaperId(wallpaper.id)}
                role="radio"
                style={{ "--preview-image": wallpaper.preview.image } as CSSProperties}
                type="button"
              >
                <span aria-hidden="true" />
                <span><strong>{wallpaper.name}</strong><small>{wallpaper.preview.label}</small></span>
              </button>
            ))}
          </div>
          <SettingRow label="Icon lighting" detail="Adds a restrained highlight to app tiles." control={<Switch checked={preferences.iconLighting} label="Icon lighting" onChange={(enabled) => dispatch({ type: "icon-lighting/set", enabled })} />} />
          <SettingRow label="High contrast" detail="Reinforces edges and flattens shadows." control={<Switch checked={preferences.highContrast} label="High contrast" onChange={(enabled) => dispatch({ type: "high-contrast/set", enabled })} />} />
        </section>
      </div>
    );
  }

  if (categoryId === "sounds") {
    return (
      <div className={styles.controlGroups}><section><h2>Sounds and motion</h2>
        <SettingRow label="System sounds" detail="Off by default. Nothing autoplays." control={<Switch checked={preferences.soundEnabled} label="System sounds" onChange={(enabled) => dispatch({ type: "sound/set", enabled })} />} />
        <SettingRow label="Reduced motion" detail={controller.effectiveAccessibility.reducedMotion ? "Reduced motion is currently effective." : "Short transitions are enabled."} control={<Switch checked={preferences.extraReducedMotion} label="Reduced motion" onChange={(enabled) => dispatch({ type: "reduced-motion/set", enabled })} />} />
        <SettingRow label="Screensaver" control={<Switch checked={preferences.screensaverEnabled} label="Screensaver" onChange={(enabled) => dispatch({ type: "screensaver/set", enabled })} />} />
        <SettingRow label="Notification effects" control={<Switch checked={preferences.notificationEffects} label="Notification effects" onChange={(enabled) => dispatch({ type: "notification-effects/set", enabled })} />} />
      </section></div>
    );
  }

  if (categoryId === "accessibility") {
    return (
      <div className={styles.controlGroups}><section><h2>Accessible presentation</h2>
        <SettingRow label="Reduced motion" detail="System preference always wins." control={<Switch checked={preferences.extraReducedMotion} label="Extra reduced motion" onChange={(enabled) => dispatch({ type: "reduced-motion/set", enabled })} />} />
        <SettingRow label="High contrast" control={<Switch checked={preferences.highContrast} label="High contrast" onChange={(enabled) => dispatch({ type: "high-contrast/set", enabled })} />} />
        <SettingRow label="Preferred presentation" control={<select aria-label="Preferred presentation" onChange={(event) => dispatch({ type: "display-preference/set", preference: event.currentTarget.value as "auto" | "desktop" | "pocket" })} value={preferences.displayPreference}><option value="auto">Automatic</option><option value="desktop">Desktop OS</option><option value="pocket">Pocket OS</option></select>} />
      </section></div>
    );
  }

  if (categoryId === "personality") {
    return (
      <div className={styles.controlGroups}><section><h2>System personality</h2>
        <SettingRow label="Personality" control={<select aria-label="System personality" onChange={(event) => dispatch({ type: "system-personality/set", personality: event.currentTarget.value as SystemPersonality })} value={preferences.systemPersonality}><option value="balanced">Balanced</option><option value="quiet">Quiet</option><option value="playful">Playful</option></select>} />
        <SettingRow label="Discovery notifications" control={<Switch checked={preferences.discoveryNotifications} label="Discovery notifications" onChange={(enabled) => dispatch({ type: "discovery-notifications/set", enabled })} />} />
        <SettingRow label="App badges" control={<Switch checked={preferences.appBadges} label="App badges" onChange={(enabled) => dispatch({ type: "app-badges/set", enabled })} />} />
        <label className={styles.sliderRow}><span><strong>Tolerance for bad ideas</strong><small>Reversible, but discoveries remain earned.</small></span><input aria-label="Tolerance for bad ideas" max="100" min="0" onChange={(event) => controller.setTolerance(Number(event.currentTarget.value))} type="range" value={preferences.badIdeaTolerance} /><output>{preferences.badIdeaTolerance}%</output><span className={styles.rangeLabels}><small>Low</small><small>High</small></span></label>
      </section></div>
    );
  }

  if (categoryId === "focus") {
    const modes: readonly [FocusMode, string, string][] = [
      ["build", "Build Mode", "Routes, code, and shipping."],
      ["design", "Design Mode", "Visual systems and interface detail."],
      ["arcade", "Arcade Mode", "Games and experiments."],
      ["client-feedback", "Client Feedback Mode", "Translate revisions into concrete decisions."],
      ["pretending-to-work", "Pretending to Work", "A highly legible decoy state."],
    ];
    return <div className={styles.controlGroups}><section><h2>Choose a focus</h2>{modes.map(([id, label, detail]) => <label className={styles.radioRow} key={id}><input checked={preferences.focusMode === id} name="focus-mode" onChange={() => controller.setFocusMode(id)} type="radio" /><span><strong>{label}</strong><small>{detail}</small></span></label>)}</section></div>;
  }

  if (categoryId === "recycle") {
    return <div className={styles.controlGroups}><section><h2>Recycle behavior</h2>
      <SettingRow label="Show discarded experiments" control={<Switch checked={preferences.showDiscardedExperiments} label="Show discarded experiments" onChange={(enabled) => dispatch({ type: "show-discarded-experiments/set", enabled })} />} />
      <SettingRow label="Auto-delete generic concepts" detail="Off. Generic concepts deserve due process." control={<Switch checked={preferences.autoDeleteGenericConcepts} label="Auto-delete generic concepts" onChange={(enabled) => dispatch({ type: "auto-delete-generic-concepts/set", enabled })} />} />
      <SettingRow label="Recycle sound" control={<Switch checked={preferences.recycleSound} label="Recycle sound" onChange={(enabled) => dispatch({ type: "recycle-sound/set", enabled })} />} />
      <Link className={styles.routeLink} href="/recycle">Open Recycle and restore bad ideas</Link>
    </section></div>;
  }

  if (categoryId === "discoveries") return <Discoveries controller={controller} />;

  return (
    <div className={styles.controlGroups}>
      <section><h2>WestCose Pocket</h2>
        <SettingRow label="Automatic Updates" detail="Installs redesigns while you sleep" control={<Switch checked={preferences.automaticUpdates} label="Automatic Updates" onChange={(enabled) => dispatch({ type: "automatic-updates/set", enabled })} />} />
        <div className={styles.actionList}>
          <button onClick={controller.systemActions.replayStartup} type="button">Replay startup</button>
          <button onClick={() => confirmAction("Reset the Pocket home screen and session?", controller.systemActions.resetSession)} type="button">Reset home screen and session</button>
          <button onClick={() => confirmAction("Clear every local note and curated-note override on this device?", controller.systemActions.resetLocalNotes)} type="button">Clear Local Notes</button>
          <button onClick={() => confirmAction("Reset all earned discoveries and unlocked themes?", controller.systemActions.resetDiscoveries)} type="button">Reset Discoveries</button>
          <button onClick={() => confirmAction("Reset preferences to their defaults?", controller.systemActions.resetPreferences)} type="button">Reset Preferences</button>
          <button className={styles.danger} onClick={() => confirmAction("Reset preferences, session, local notes, and discoveries on this device?", controller.systemActions.resetAllLocalState)} type="button">Reset All Local State</button>
        </div>
      </section>
      <section className={styles.about}><h2>About WestCose OS</h2><p>WestCose Labs OS v3</p><p>Build Status: Stable Enough</p><p>Local-first preferences. No account required.</p></section>
    </div>
  );
}

function SettingsCategoryPage({ controller }: { readonly controller: SettingsController }) {
  const categoryId =
    controller.view.kind === "category"
      ? controller.view.categoryId
      : undefined;
  const category = controller.categories.find((item) => item.id === categoryId);
  return (
    <div className={styles.page}>
      <header className={styles.nestedHeader}>
        <Link href="/settings">‹ Settings</Link>
        <span>{category?.label ?? "Settings"}</span>
      </header>
      <div className={styles.categoryTitle}>
        <small>{category?.description}</small>
        <h1 tabIndex={-1}>{category?.label ?? "Settings"}</h1>
      </div>
      <DiscoveryNotice controller={controller} />
      <CategoryControls controller={controller} />
    </div>
  );
}

export function PocketSettingsHome({
  controller,
}: {
  readonly controller: SettingsController;
}) {
  return (
    <div className={styles.app} data-app-presenter="pocket-settings" data-route-content>
      {controller.view.kind === "home" ? <SettingsHome controller={controller} /> : <SettingsCategoryPage controller={controller} />}
    </div>
  );
}
