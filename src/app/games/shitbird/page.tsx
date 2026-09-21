import { ShitbirdGame } from "@/components/apps/games/shitbird/ShitbirdGame";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "SHITBIRD", description: "One bird. No prospects. An original WestCose coastal arcade game.", path: "/games/shitbird",
});

export default function ShitbirdPage() { return <ShitbirdGame />; }
