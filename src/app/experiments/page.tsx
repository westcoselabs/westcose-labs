import { ExperimentsShowcase } from "@/components/experiments/ExperimentsShowcase";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Experiments, Prototypes & Build Logs",
  description: "Working 3D demos, game development tests, creative tools, interface experiments, and build notes from WestCose Labs.",
  path: "/experiments",
});

export default function ExperimentsPage() {
  return <ExperimentsShowcase />;
}
