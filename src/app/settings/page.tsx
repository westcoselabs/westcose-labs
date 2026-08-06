import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Settings",
  description: "Display and accessibility settings for WestCose Labs OS.",
  path: "/settings",
});

export default function SettingsPage() {
  return (
    <RouteDocument
      eyebrow="Control panel"
      title="Settings"
      description="Preferences are intentionally small, local, and reversible."
    >
      <RouteSection title="Display">
        <p>
          Dusk is the only complete decorative theme in V1. Normal View is a
          presentation preference, not a separate content tree, and its links
          preserve <code>?view=normal</code>.
        </p>
      </RouteSection>
      <RouteSection title="Accessibility">
        <p>
          Extra reduced motion can be enabled, but never overrides an operating
          system request to reduce motion. High contrast reduces shadow
          dependence and adds explicit structural boundaries.
        </p>
      </RouteSection>
      <RouteSection title="Local data">
        <p>
          Preferences use versioned local storage. Startup, unlock, README, and
          Pocket home-page state use versioned session storage. Route content,
          identity, contact messages, and game scores are never stored there.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
