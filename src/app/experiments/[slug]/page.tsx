import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExperimentStudy } from "@/components/experiments/ExperimentStudy";
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

  return <ExperimentStudy experiment={experiment} />;
}
