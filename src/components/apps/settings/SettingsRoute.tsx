"use client";

import Link from "next/link";

import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { useShellPresentation } from "@/components/os/ShellPresentationContext";

import { DesktopSettings } from "./desktop/DesktopSettings";
import { PocketSettingsHome } from "./pocket/PocketSettingsHome";
import {
  useSettingsController,
  type SettingsController,
  type SettingsRouteView,
} from "./useSettingsController";

function SemanticSettings({
  controller,
}: {
  readonly controller: SettingsController;
}) {
  const activeCategoryId =
    controller.view.kind === "category"
      ? controller.view.categoryId
      : undefined;
  const activeCategory = controller.categories.find(
    (category) => category.id === activeCategoryId,
  );

  return (
    <div data-app-presenter="semantic-settings">
      <RouteDocument
        description="Preferences are local, reversible, and shared across the two OS presentations."
        eyebrow="Settings"
        presentation="settings"
        title={activeCategory?.label ?? "Settings"}
      >
        <RouteSection title="Settings categories">
          <ul>
            {controller.categories.map((category) => (
              <li key={category.id}>
                <Link href={`/settings/${category.id}`}>{category.label}</Link>{" "}
                <span>{category.description}</span>
              </li>
            ))}
          </ul>
        </RouteSection>
        <RouteSection title="Accessibility">
          <p>
            Reduced motion and high contrast remain authoritative across every
            route and presentation.
          </p>
        </RouteSection>
        <RouteSection title="Local data">
          <p>
            Preferences, discoveries, and local notes use separate versioned
            browser-storage contracts.
          </p>
        </RouteSection>
      </RouteDocument>
    </div>
  );
}

export function SettingsRoute({
  view = { kind: "home" },
}: {
  readonly view?: SettingsRouteView;
}) {
  const shell = useShellPresentation();
  const controller = useSettingsController(view);

  if (shell === "desktop") return <DesktopSettings controller={controller} />;
  if (shell === "pocket") return <PocketSettingsHome controller={controller} />;
  return <SemanticSettings controller={controller} />;
}
