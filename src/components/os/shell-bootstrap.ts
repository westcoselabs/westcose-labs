import { APPEARANCE_BOOTSTRAP_DATA } from "@/lib/appearance";

/**
 * Runs before first paint. The appearance tables are serialised straight from
 * the theme and wallpaper registries, so the stored appearance is applied from
 * the same source the shells use at runtime, with no second definition to keep
 * in sync and no wallpaper flash on load.
 */
export const SHELL_BOOTSTRAP = String.raw`(() => {
  const root = document.documentElement;
  const appearance = ${JSON.stringify(APPEARANCE_BOOTSTRAP_DATA)};
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  let preference = "auto";
  let themeId = appearance.defaultThemeId;
  let wallpaperId = appearance.defaultWallpaperId;
  let highContrast = false;
  let reducedMotion = false;

  try {
    const currentRaw = localStorage.getItem("wcl.preferences.v2");
    const legacyRaw = currentRaw === null
      ? localStorage.getItem("wcl.preferences.v1")
      : null;
    const raw = currentRaw ?? legacyRaw;
    const parsed = raw ? JSON.parse(raw) : null;
    const expectedVersion = currentRaw === null ? 1 : 2;
    if (parsed && parsed.version === expectedVersion && parsed.data) {
      const candidate = parsed.data.displayPreference;
      if (["auto", "desktop", "pocket"].includes(candidate)) {
        preference = candidate;
      }
      if (typeof parsed.data.themeId === "string") themeId = parsed.data.themeId;
      if (typeof parsed.data.wallpaperId === "string") {
        wallpaperId = parsed.data.wallpaperId;
      }
      highContrast = parsed.data.highContrast === true;
      reducedMotion = parsed.data.extraReducedMotion === true;
    }
  } catch {}

  let unlockedThemeIds = [];
  let unlockedWallpaperIds = [];
  let discoveredSecretIds = [];

  try {
    const parsed = JSON.parse(localStorage.getItem("wcl.discoveries.v1"));
    if (parsed && parsed.version === 1 && parsed.data) {
      const ids = (value) => (Array.isArray(value) ? value : []);
      unlockedThemeIds = ids(parsed.data.unlockedThemeIds);
      unlockedWallpaperIds = ids(parsed.data.unlockedWallpaperIds);
      discoveredSecretIds = ids(parsed.data.discoveredSecretIds);
    }
  } catch {}

  const resolve = (table, id, fallbackId, unlockedIds) => {
    const entry = table[id];
    const available = entry && (!entry.hidden ||
      unlockedIds.indexOf(id) !== -1 ||
      (entry.discoveryId !== null &&
        discoveredSecretIds.indexOf(entry.discoveryId) !== -1));
    return available
      ? { id: id, entry: entry }
      : { id: fallbackId, entry: table[fallbackId] };
  };

  const theme = resolve(
    appearance.themes,
    themeId,
    appearance.defaultThemeId,
    unlockedThemeIds,
  );
  const wallpaper = resolve(
    appearance.wallpapers,
    wallpaperId,
    appearance.defaultWallpaperId,
    unlockedWallpaperIds,
  );

  const coarse = matchMedia("(pointer: coarse)").matches;
  const width = innerWidth;
  const automatic = width < 768 || (width < 1024 && coarse)
    ? "pocket"
    : "desktop";
  let shell;

  if (view === "normal") shell = "normal";
  else if (view === "os") shell = automatic;
  else if (preference === "desktop" || preference === "pocket") shell = preference;
  else shell = automatic;

  const cleanPath = location.pathname.replace(/\/+$/, "") || "/";
  if (shell === "pocket" && (cleanPath === "/contact" || cleanPath === "/terminal")) {
    shell = "normal";
  }

  root.dataset.shell = shell;
  root.dataset.shellReady = "true";
  for (const key in theme.entry.dataset) {
    root.dataset[key] = theme.entry.dataset[key];
  }
  root.dataset.wallpaper = wallpaper.id;
  for (const name in wallpaper.entry.variables) {
    root.style.setProperty(name, wallpaper.entry.variables[name]);
  }
  if (highContrast) root.dataset.highContrast = "true";
  if (reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.reducedMotion = "true";
  }
})();`;
