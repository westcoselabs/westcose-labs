import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Experiments",
  description: "WestCose Labs prototypes and technical studies.",
  path: "/experiments",
});

export default function ExperimentsPage() {
  return (
    <RouteDocument
      eyebrow="Lab index"
      title="Experiments"
      description="A home for small prototypes and technical studies once their public details are confirmed."
      status="No published entries"
    >
      <RouteSection title="Directory is ready">
        <p>
          The route and registry contract are in place, but no experiment is
          published as a production fact yet. Unknown experiment URLs correctly
          return a not-found page instead of an inert “Coming Soon” destination.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
