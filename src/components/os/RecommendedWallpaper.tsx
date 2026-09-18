"use client";

import { Button } from "@/components/ui";
import { useAppearance } from "./AppearanceContext";
import styles from "./RecommendedWallpaper.module.css";

/** An explicit opt-in; changing themes never overwrites a wallpaper choice. */
export function RecommendedWallpaper() {
  const { theme, wallpaper, availableWallpapers, setWallpaperId } = useAppearance();
  const recommended = availableWallpapers.find(
    (entry) => entry.id === theme.recommendedWallpaperId,
  );
  if (!recommended) return null;

  return (
    <div className={styles.recommendation}>
      <p>Recommended for {theme.name}: <strong>{recommended.name}</strong>.</p>
      <Button
        disabled={wallpaper.id === recommended.id}
        onClick={() => setWallpaperId(recommended.id)}
        tone="secondary"
      >
        Use recommended wallpaper
      </Button>
    </div>
  );
}
