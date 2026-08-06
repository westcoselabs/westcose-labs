import { DevelopmentFixture } from "@/components/apps/DevelopmentFixture";
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
      description="A lightweight project launcher. No game engine or unverified build is included in the initial bundle."
      status="Build unavailable"
    >
      <DevelopmentFixture>
        Artwork, controls, production notes, and playable build status need owner
        confirmation before this launcher can offer Play.
      </DevelopmentFixture>
      <RouteSection title="Launcher status">
        <p>
          The presentation shell is ready for a future <code>GameMount</code>
          boundary. That boundary will load only after an explicit Play action,
          and only when a verified build is supplied.
        </p>
        <button
          className="route-action route-action--primary"
          type="button"
          disabled
        >
          Play unavailable
        </button>
      </RouteSection>
      <RouteSection title="Initial-bundle contract">
        <ul>
          <li>No game engine request on the home or Games route.</li>
          <li>No online score, achievement, or save infrastructure.</li>
          <li>Launcher content remains readable in every presentation shell.</li>
        </ul>
      </RouteSection>
    </RouteDocument>
  );
}
