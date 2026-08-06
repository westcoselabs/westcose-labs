import Link from "next/link";
import Image from "next/image";

import {
  RouteCardGrid,
  RouteDocument,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Games",
  description: "WestCose Labs game projects and development launchers.",
  path: "/games",
});

export default function GamesPage() {
  return (
    <RouteDocument
      eyebrow="Program library"
      title="Games"
      description="Game work is presented without loading an engine until a verified build exists and you explicitly choose Play."
      status="1 launcher"
      presentation="games"
    >
      <RouteCardGrid>
        <article className="route-card route-card--feature">
          <div className="game-cover-art">
            <Image
              alt="Concept cover art of a worn boxing glove inside a graphite arcade cabinet"
              fill
              sizes="(max-width: 48rem) 100vw, 44rem"
              src="/images/projects/fightclub-concept-cover.webp"
            />
            <span>Concept cover art</span>
          </div>
          <p className="route-card__index">Development launcher</p>
          <h2>
            <Link href="/games/fightclub">FightClub</Link>
          </h2>
          <p>
            A production-facing project presentation and future lazy game mount.
            Engine and playable build status are not yet confirmed.
          </p>
          <Link className="route-card__open" href="/games/fightclub">
            Open launcher
          </Link>
        </article>
      </RouteCardGrid>
    </RouteDocument>
  );
}
