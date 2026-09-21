import { FightClubLauncher } from "@/components/apps/FightClubLauncher";
import { createRouteMetadata } from "@/registry";
export const metadata = createRouteMetadata({
  title: "FightClub",
  description:
    "A WestCose Labs launcher for the remotely hosted Citryn Fight Club build.",
  path: "/games/fightclub",
});
export default function FightClubPage() {
  return <FightClubLauncher />;
}
