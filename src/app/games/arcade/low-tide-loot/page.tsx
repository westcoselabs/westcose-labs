import { LowTideLootLauncher } from "@/components/apps/games/low-tide-loot/LowTideLootLauncher";
import { createRouteMetadata } from "@/registry";

export const metadata = {
  ...createRouteMetadata({
  title: "LOW TIDE LOOT",
  description:
    "Make rent before the tide comes back. WestCose Arcade No. 002: a one-button beach salvage game.",
  path: "/games/arcade/low-tide-loot",
  }),
  manifest: "/games/low-tide-loot/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Low Tide Loot", statusBarStyle: "black-translucent" as const },
};
export default function LowTideLootPage() {
  return <LowTideLootLauncher />;
}
