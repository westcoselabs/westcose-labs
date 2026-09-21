import { GameLibrary } from "@/components/apps/games/GameLibrary";
import { createRouteMetadata } from "@/registry";
export const metadata = createRouteMetadata({
  title: "Arcade",
  description: "Three games. No quarters required. WestCose Amusements.",
  path: "/games/arcade",
});
export default function GamesPage() {
  return <GameLibrary />;
}
