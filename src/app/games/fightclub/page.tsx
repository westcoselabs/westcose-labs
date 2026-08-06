import { DevelopmentFixture } from "@/components/apps/DevelopmentFixture";
import { FightClubLauncher } from "@/components/apps/FightClubLauncher";
import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "FightClub",
  description: "FightClub project launcher and development presentation.",
  path: "/games/fightclub",
});

export default function FightClubPage() {
  return (
    <RouteDocument
      eyebrow="Game project"
      title="FightClub"
      description="A lightweight project launcher with a future lazy game boundary."
      status="Build unavailable"
      presentation="game"
    >
      <FightClubLauncher />
      <DevelopmentFixture>
        Approved artwork, controls, production notes, version, and playable build
        status are still required. The Uninstall action is a harmless Easter egg.
      </DevelopmentFixture>
      <RouteSection title="Load boundary">
        <ul>
          <li>No game engine request on Home or the Games route.</li>
          <li>No unverified Play action, score, achievement, or save state.</li>
          <li>A future build mounts only after an explicit launch.</li>
        </ul>
      </RouteSection>
    </RouteDocument>
  );
}
