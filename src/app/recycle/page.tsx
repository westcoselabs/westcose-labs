import { DoNotOpen } from "@/components/apps/DoNotOpen";
import { RecycleExplorer } from "@/components/apps/RecycleExplorer";
import { RouteDocument } from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Recycle",
  description: "A harmless archive of nonessential WestCose Labs material.",
  path: "/recycle",
});

export default function RecyclePage() {
  return (
    <RouteDocument
      title="Quarantine"
      header={<DoNotOpen />}
      presentation="recycle"
    >
      <RecycleExplorer />
    </RouteDocument>
  );
}
