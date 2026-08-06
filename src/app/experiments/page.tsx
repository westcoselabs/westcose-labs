import Link from "next/link";

import {
  RouteCardGrid,
  RouteDocument,
} from "@/components/apps/RouteDocument";
import {
  createRouteMetadata,
  experimentRegistry,
} from "@/registry";

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
      description="Small technical studies extracted from working parts of this portfolio system."
      status={`${experimentRegistry.length} verified studies`}
      presentation="experiments"
    >
      <RouteCardGrid>
        {experimentRegistry.map((experiment) => (
          <article
            className="route-card experiment-card"
            data-tone={experiment.tone}
            key={experiment.slug}
          >
            <p className="route-card__index">{experiment.status}</p>
            <h2><Link href={`/experiments/${experiment.slug}`}>{experiment.title}</Link></h2>
            <p>{experiment.purpose}</p>
            <small>{experiment.requirements}</small>
            <Link className="route-card__open" href={`/experiments/${experiment.slug}`}>
              Inspect experiment
            </Link>
          </article>
        ))}
      </RouteCardGrid>
    </RouteDocument>
  );
}
