import Link from "next/link";

import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import {
  capabilityRegistry,
  createRouteMetadata,
} from "@/registry";

export const metadata = createRouteMetadata({
  title: "Services",
  description: "The WestCose Labs product and engineering capability map.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <RouteDocument
      eyebrow="Installed modules"
      title="Services"
      description="Capabilities connected to working proof inside this portfolio. Availability and engagement terms require confirmation."
      presentation="services"
      actions={[
        { href: "/projects", label: "View projects", variant: "primary" },
        { href: "/contact", label: "Contact" },
      ]}
    >
      <div className="capability-index">
        {capabilityRegistry.map((capability) => (
          <article key={capability.id}>
            <h2>{capability.title}</h2>
            <p>{capability.description}</p>
            <Link href={capability.proofHref}>{capability.proofLabel}</Link>
          </article>
        ))}
      </div>
      <RouteSection title="Scope note">
        <p>
          This is a capability map, not a promise of current availability,
          pricing, or a fixed package. Those details appear only after approval.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
