import Link from "next/link";

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
    >
      <RouteCardGrid>
        <article className="route-card route-card--feature">
          <p className="route-card__index">PROJECT / LAUNCHER</p>
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
