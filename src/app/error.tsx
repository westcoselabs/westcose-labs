"use client";

import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { Button } from "@/components/ui";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <RouteDocument
      description="The presentation shell is still available, but this route did not finish loading."
      eyebrow="System / recovery"
      status="Recoverable error"
      title="This route hit a snag"
    >
      <RouteSection title="Try again">
        <p>No content was submitted or stored.</p>
        <Button onClick={reset} tone="primary">
          Reload this route
        </Button>
      </RouteSection>
    </RouteDocument>
  );
}
