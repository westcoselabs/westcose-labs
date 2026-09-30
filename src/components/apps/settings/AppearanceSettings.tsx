"use client";

import { Check, Monitor, Sparkle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { RecommendedWallpaper } from "@/components/os/RecommendedWallpaper";
import type { SettingsController } from "./useSettingsController";
import styles from "./AppearanceSettings.module.css";

/** Small OS scenes let visitors compare the skins without changing their wallpaper. */
function ThemeScene({ id, wallpaper }: { id: string; wallpaper?: string }) {
  return (
    <span aria-hidden="true" className={styles.scene} data-preview-theme={id}
      style={{ "--scene-wallpaper": wallpaper } as CSSProperties}>
      <span className={styles.sceneIcons}><i /><i /><i /></span>
      <span className={styles.sceneWindow}>
        <span className={styles.sceneTitle}><i /><i /><i /></span>
        <span className={styles.sceneBody}><span /><span /><b /></span>
      </span>
      <span className={styles.sceneDock}><i /><i /><i /><i /></span>
    </span>
  );
}

export function AppearanceSettings({ controller }: { controller: SettingsController }) {
  const { preferences, dispatch } = controller;
  const current = controller.availableThemes.find(theme => theme.id === controller.activeThemeId);
  return (
    <div className={styles.appearance}>
      <section className={styles.section} aria-labelledby="appearance-themes">
        <header className={styles.sectionHeader}>
          <div><h2 id="appearance-themes">Theme</h2><p>Choose a look for your OS.</p></div>
          <label className={styles.quickSelect}><span className="sr-only">Theme</span>
            <select value={controller.activeThemeId} onChange={event => controller.setThemeId(event.currentTarget.value)}>
              {controller.availableThemes.map(theme => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
          </label>
        </header>
        <div className={styles.themeGrid} aria-label="Theme previews">
          {controller.availableThemes.map(theme => {
            const selected = theme.id === controller.activeThemeId;
            const wallpaper = controller.availableWallpapers.find(item => item.id === theme.recommendedWallpaperId);
            return (
              <button key={theme.id} type="button" className={styles.themeChoice}
                aria-label={`Apply ${theme.name} theme`} aria-pressed={selected}
                onClick={() => controller.setThemeId(theme.id)}>
                <ThemeScene id={theme.id} wallpaper={wallpaper?.preview.image} />
                <span className={styles.themeCaption}><strong>{theme.name}</strong><span className={styles.check}><Check weight="bold" /></span></span>
                <span className={styles.themeDescription}>{theme.description}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.saved}><Check aria-hidden="true" weight="bold" /> {current?.name} is active. Changes save automatically.</p>
      </section>

      <section className={styles.section} aria-labelledby="appearance-wallpapers">
        <header className={styles.sectionHeader}><div><h2 id="appearance-wallpapers">Wallpaper</h2><p>A backdrop of your own. Changing themes keeps your choice.</p></div></header>
        <div aria-label="Wallpaper" className={styles.wallpaperGrid} role="radiogroup">
          {controller.availableWallpapers.map((wallpaper, index) => (
            <button key={wallpaper.id} type="button" role="radio"
              aria-checked={wallpaper.id === controller.activeWallpaperId}
              tabIndex={wallpaper.id === controller.activeWallpaperId ? 0 : -1}
              className={styles.wallpaperChoice}
              onClick={() => controller.setWallpaperId(wallpaper.id)}
              onKeyDown={event => {
                const step = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
                if (!step) return;
                event.preventDefault();
                const next = (index + step + controller.availableWallpapers.length) % controller.availableWallpapers.length;
                controller.setWallpaperId(controller.availableWallpapers[next].id);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
              }}>
              <span className={styles.wallpaperImage} aria-hidden="true" style={{ backgroundImage: wallpaper.preview.image }}><span className={styles.check}><Check weight="bold" /></span></span>
              <strong>{wallpaper.name}</strong><small>{wallpaper.preview.label}</small>
            </button>
          ))}
        </div>
        <div className={styles.recommendation}><RecommendedWallpaper /></div>
      </section>

      <section className={styles.section} aria-labelledby="appearance-details">
        <header className={styles.sectionHeader}><div><h2 id="appearance-details">Finishing touches</h2><p>Make the details work for you.</p></div></header>
        <div className={styles.options}>
          {[
            { label: "Icon lighting", detail: "Soft highlights on your app icons.", checked: preferences.iconLighting, action: "icon-lighting/set" as const, Icon: Sparkle },
            { label: "High contrast", detail: "Stronger edges and clearer separation.", checked: preferences.highContrast, action: "high-contrast/set" as const, Icon: Monitor },
          ].map(({ label, detail, checked, action, Icon }) => (
            <label className={styles.option} key={label}>
              <Icon aria-hidden="true" size={22} />
              <span><strong>{label}</strong><small>{detail}</small></span>
              <input type="checkbox" aria-label={label} checked={checked} onChange={event => dispatch({ type: action, enabled: event.currentTarget.checked })} />
              <span aria-hidden="true" className={styles.switch} />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
