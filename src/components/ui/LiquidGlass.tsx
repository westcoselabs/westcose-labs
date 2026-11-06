"use client";

import { lazy, Suspense, useSyncExternalStore } from "react";
import type { GlassOptics } from "@samasante/liquid-glass";

import { useAppearance } from "@/components/os/AppearanceContext";
import { useSettings } from "@/components/os/SettingsContext";

const Glass = lazy(() => import("@samasante/liquid-glass").then((module) => ({ default: module.Glass })));

const opaqueMedia = "(prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)";
// Mobile Safari cannot reliably compose the library's SVG refraction with a
// moving sheet. Use the existing, bounded CSS glass material on touch screens;
// it keeps real backdrop blur, rim lighting and contrast without a second lens.
const cssMaterialMedia = `${opaqueMedia}, (max-width: 767px), (pointer: coarse) and (max-width: 1023px)`;
function subscribe(callback: () => void) {
  if (!window.matchMedia) return () => {};
  const media = window.matchMedia(cssMaterialMedia);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getSnapshot = () => !window.matchMedia || window.matchMedia(cssMaterialMedia).matches;
const getServerSnapshot = () => false;

const optics: Partial<GlassOptics> = {
  strength: 0.035,
  depth: 0.18,
  curvature: 0.12,
  bend: 0.3,
  bendWidth: 0.14,
  dispersion: 0.12,
  frost: 12,
  saturate: 1.55,
  brightness: 0,
  specular: 0.75,
};

/** A decorative sibling keeps semantic controls and their state mounted across
 * skin changes. Only shell chrome gets a lens; reading surfaces stay opaque. */
export function LiquidGlass({ tone = "regular" }: { tone?: "regular" | "strong" | "clear" }) {
  const { theme } = useAppearance();
  const settings = useSettings();
  if (theme.id !== "liquid-glass" || settings?.effectiveAccessibility.highContrast) return null;
  return <GlassLayer tone={tone} />;
}

function GlassLayer({ tone }: { tone: "regular" | "strong" | "clear" }) {
  const prefersOpaque = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (prefersOpaque) return null;

  return (
    <Suspense fallback={null}>
      <Glass
        aria-hidden="true"
        data-liquid-glass={tone}
        optics={optics}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          borderRadius: "inherit",
          background: `var(--glass-${tone})`,
          display: "var(--glass-engine-display, none)",
        }}
      >
        {/* A non-null child selects the library's auto-sized material mode. */}
        <></>
      </Glass>
    </Suspense>
  );
}
