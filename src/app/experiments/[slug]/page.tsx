import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import {
  createRouteMetadata,
  experimentRegistry,
  getExperiment,
} from "@/registry";

type ExperimentPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experimentRegistry.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({ params }: ExperimentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  return createRouteMetadata({
    title: experiment?.title ?? "Experiment not found",
    description: experiment?.purpose ?? "The requested experiment is not published.",
    path: `/experiments/${slug}`,
  });
}

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) notFound();

  return (
    <RouteDocument
      eyebrow="Technical study"
      title={experiment.title}
      description={experiment.purpose}
      status={experiment.status}
      presentation="experiments"
    >
      <RouteSection title="Interaction requirements">
        <p>{experiment.requirements}</p>
      </RouteSection>
      <RouteSection title="Verified proof">
        <p>{experiment.proof}</p>
      </RouteSection>
    </RouteDocument>
  );
}
