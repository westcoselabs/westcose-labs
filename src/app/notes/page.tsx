import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Notes",
  description: "README and field notes for WestCose Labs OS.",
  path: "/notes",
});

export default function NotesPage() {
  return (
    <RouteDocument
      eyebrow="README.txt"
      title="Welcome to the workstation"
      description="A short field guide to the portfolio interface."
    >
      <RouteSection title="Three views, one site">
        <ul>
          <li>
            <strong>Desktop OS</strong> uses icons, a route window, utilities,
            and a taskbar for pointer-oriented screens.
          </li>
          <li>
            <strong>Pocket OS</strong> uses a lock screen, two home pages, a fixed
            dock, and one full-screen app at a time.
          </li>
          <li>
            <strong>Normal View</strong> keeps the same routes in a conventional,
            low-effect document layout.
          </li>
        </ul>
      </RouteSection>
      <RouteSection title="Nothing essential is hidden">
        <p>
          Keyboard and visible-menu alternatives cover icon opening, window
          management, and context actions. Normal View remains available without
          completing startup, unlock, drag, resize, or a hidden interaction.
        </p>
      </RouteSection>
      <RouteSection title="Try these first">
        <ul>
          <li>Open Projects to see the shared-route architecture.</li>
          <li>Visit Settings to adjust motion, contrast, sound, or view.</li>
          <li>Use your browser Back and Forward controls normally.</li>
        </ul>
      </RouteSection>
    </RouteDocument>
  );
}
