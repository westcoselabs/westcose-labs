import {
  RouteCardGrid,
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Services",
  description: "The WestCose Labs product and engineering capability map.",
  path: "/services",
});

const capabilityAreas = [
  {
    title: "Product interfaces",
    detail:
      "Responsive, semantic interfaces designed around the real content and interaction model.",
  },
  {
    title: "Front-end architecture",
    detail:
      "Typed component systems, route-aware state, performance boundaries, and maintainable CSS.",
  },
  {
    title: "Prototypes and experiments",
    detail:
      "Focused proofs that answer product and technical questions before a larger build.",
  },
] as const;

export default function ServicesPage() {
  return (
    <RouteDocument
      eyebrow="Capability map"
      title="Services"
      description="A concise view of the disciplines this portfolio is built to demonstrate. Engagement terms and availability require owner confirmation."
      actions={[
        { href: "/projects", label: "View the work", variant: "primary" },
        { href: "/contact", label: "Contact" },
      ]}
    >
      <RouteCardGrid>
        {capabilityAreas.map((capability, index) => (
          <article className="route-card" key={capability.title}>
            <p className="route-card__index">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2>{capability.title}</h2>
            <p>{capability.detail}</p>
          </article>
        ))}
      </RouteCardGrid>
      <RouteSection title="Scope note">
        <p>
          This page describes capability areas, not a promise of current
          availability, pricing, or a fixed service package. Those production
          details will be added only after owner approval.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
