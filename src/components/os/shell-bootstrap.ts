export const SHELL_BOOTSTRAP = String.raw`(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  let preference = "auto";
  let theme = "dusk";
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
      if (typeof parsed.data.themeId === "string") theme = parsed.data.themeId;
      highContrast = parsed.data.highContrast === true;
      reducedMotion = parsed.data.extraReducedMotion === true;
    }
  } catch {}

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
  root.dataset.theme = theme;
  if (highContrast) root.dataset.highContrast = "true";
  if (reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.reducedMotion = "true";
  }
})();`;
