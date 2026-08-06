import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createRouteMetadata } from "@/registry";

type ExperimentPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ExperimentPageProps): Promise<Metadata> {
  const { slug } = await params;
  return createRouteMetadata({
    title: "Experiment not found",
    description: "The requested WestCose Labs experiment is not published.",
    path: `/experiments/${slug}`,
  });
}

export default function ExperimentPage() {
  notFound();
}
