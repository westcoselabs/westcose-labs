import Link from "next/link";

import {
  RouteCardGrid,
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
});

const destinations = [
  {
    href: "/projects",
    title: "Projects",
    description: "Selected product, web, and software work.",
  },
  {
    href: "/games",
    title: "Games",
    description: "Launchers, playable work, and development notes.",
  },
  {
    href: "/experiments",
    title: "Experiments",
    description: "Small studies, prototypes, and technical investigations.",
  },
  {
    href: "/about",
    title: "About",
    description: "Background, approach, and this portfolio system.",
  },
] as const;

export default function Home() {
  return (
    <RouteDocument
      eyebrow="Personal creative workstation"
      title="WestCose Labs OS"
      description="One portfolio, presented as a tactile desktop, a touch-first Pocket OS, or a conventional document view."
      actions={[
        { href: "/projects", label: "Browse projects", variant: "primary" },
        { href: "/about", label: "About the lab" },
      ]}
    >
      <RouteSection title="A portfolio with three ways in">
        <p>
          The active route selects the content. Your display preference selects
          the shell around it. Every essential destination remains a real browser
          route, so the interface never gets between you and the work.
        </p>
      </RouteSection>

      <RouteSection title="Explore">
        <RouteCardGrid>
          {destinations.map((destination) => (
            <article className="route-card" key={destination.href}>
              <p className="route-card__index" aria-hidden="true">
                {String(destinations.indexOf(destination) + 1).padStart(2, "0")}
              </p>
              <h2>
                <Link href={destination.href}>{destination.title}</Link>
              </h2>
              <p>{destination.description}</p>
              <Link className="route-card__open" href={destination.href}>
                Open
              </Link>
            </article>
          ))}
        </RouteCardGrid>
      </RouteSection>
    </RouteDocument>
  );
}
