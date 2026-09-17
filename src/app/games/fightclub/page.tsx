import { DevelopmentFixture } from "@/components/apps/DevelopmentFixture";
import { FightClubLauncher } from "@/components/apps/FightClubLauncher";
import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "FightClub",
  description:
    "A WestCose Labs launcher for the remotely hosted Citryn Fight Club build.",
  path: "/games/fightclub",
});

export default function FightClubPage() {
  return (
    <RouteDocument
      eyebrow="Game project"
      title="FightClub"
      description="A remotely hosted arcade fighter that loads only after an explicit Play action."
      status="Hosted build available"
      presentation="game"
    >
      <FightClubLauncher />
      <DevelopmentFixture>
        The hosted build and controls are verified. Project credits, production
        notes, and approval for the concept cover still require owner input. The
        Uninstall action remains a harmless Easter egg.
      </DevelopmentFixture>
      <RouteSection title="Hosted runtime boundary">
        <ul>
          <li>No remote game request on Home, boot, Games, or this launcher&apos;s initial render.</li>
          <li>The iframe is created only after Play and always has OS-owned Exit controls.</li>
          <li>An external launch remains available if embedding later becomes unreliable.</li>
          <li>No remote messages are consumed because the hosted build publishes no message contract.</li>
        </ul>
      </RouteSection>
    </RouteDocument>
  );
}
