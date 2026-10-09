import { ExperimentsShowcase } from "@/components/experiments/ExperimentsShowcase";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Experiments",
  description: "WestCose Labs prototypes and technical studies.",
  path: "/experiments",
});

export default function ExperimentsPage() {
  return <ExperimentsShowcase />;
}
