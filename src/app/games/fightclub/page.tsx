import { redirect } from "next/navigation";
import { fightClubRegistry } from "@/registry/fightclub";
import { createRouteMetadata } from "@/registry";
export const metadata = createRouteMetadata({
  title: "FightClub",
  description:
    "Play the hosted FightClub arcade fighter on Higgsfield.",
  path: "/games/fightclub",
});
export default function FightClubPage() {
  redirect(fightClubRegistry[0].hostedBuild.launchUrl);
}
