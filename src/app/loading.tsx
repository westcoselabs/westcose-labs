import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";

export default function Loading() {
  return (
    <RouteDocument
      description="Preparing the requested route and its shared content."
      eyebrow="System / route"
      status="Loading"
      title="Opening…"
    >
      <RouteSection title="Please hold">
        <p aria-live="polite">The route is loading.</p>
      </RouteSection>
    </RouteDocument>
  );
}
