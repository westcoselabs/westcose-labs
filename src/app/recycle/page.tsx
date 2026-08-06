import { DoNotOpen } from "@/components/apps/DoNotOpen";
import { RecycleExplorer } from "@/components/apps/RecycleExplorer";
import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, personalityRegistry } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Recycle",
  description: "A harmless archive of nonessential WestCose Labs material.",
  path: "/recycle",
});

export default function RecyclePage() {
  return (
    <RouteDocument
      eyebrow="Recently deleted"
      title="Recycle"
      description="Discarded concepts and harmless oddities. Nothing essential is stored only here."
      status={`${personalityRegistry.recycleFiles.length} recoverable ideas`}
      presentation="recycle"
    >
      <RecycleExplorer />
      <RouteSection title="Quarantined item">
        <p>This optional interaction is harmless and easy to dismiss.</p>
        <DoNotOpen />
      </RouteSection>
    </RouteDocument>
  );
}
