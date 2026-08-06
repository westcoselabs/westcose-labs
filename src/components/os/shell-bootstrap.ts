export const SHELL_BOOTSTRAP = String.raw`(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  let preference = "auto";
  let highContrast = false;
  let reducedMotion = false;

  try {
    const raw = localStorage.getItem("wcl.preferences.v1");
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.version === 1 && parsed.data) {
      const candidate = parsed.data.displayPreference;
      if (["auto", "desktop", "pocket", "normal"].includes(candidate)) {
        preference = candidate;
      }
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
  else if (preference === "normal") shell = "normal";
  else if (preference === "desktop" || preference === "pocket") shell = preference;
  else shell = automatic;

  const cleanPath = location.pathname.replace(/\/+$/, "") || "/";
  if (shell === "pocket" && (cleanPath === "/contact" || cleanPath === "/terminal")) {
    shell = "normal";
  }

  root.dataset.shell = shell;
  root.dataset.shellReady = "true";
  root.dataset.theme = "dusk";
  if (highContrast) root.dataset.highContrast = "true";
  if (reducedMotion || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.dataset.reducedMotion = "true";
  }
})();`;
