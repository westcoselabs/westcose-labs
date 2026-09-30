import Link from "next/link";
import { RouteCardGrid, RouteDocument, RouteSection } from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";
import { serviceRegistry } from "@/registry/services";

export const metadata = createRouteMetadata({
  title: "Website Design & Development Services",
  description: "Explore custom website design and web development from WestCose Labs. See relevant projects, learn about the process, and discuss your business needs.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <RouteDocument
      eyebrow="Websites with a purpose"
      title="Website design and web development services"
      description="Custom websites for businesses that need a clear message, a distinct visual identity, and a useful experience on every screen. Start with design, development, or a project that brings both together."
      presentation="services"
      actions={[{ href: "/contact", label: "Discuss your website", variant: "primary" }, { href: "/projects", label: "View project work" }]}
    >
      <RouteSection title="Choose the support your website needs">
        <RouteCardGrid>
          {serviceRegistry.map((service) => (
            <article className="route-card" key={service.slug}>
              <h3><Link href={`/services/${service.slug}`}>{service.name}</Link></h3>
              <p>{service.summary}</p>
              <Link href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()}</Link>
            </article>
          ))}
        </RouteCardGrid>
      </RouteSection>
      <RouteSection title="New websites, redesigns, and custom functionality">
        <p>A new website starts with the business, its audience, and the content that needs to be communicated. A redesign starts by understanding what works today and where visitors get stuck. Custom development starts with the workflow or functionality the website needs to support.</p>
        <p>WestCose Labs works across visual design, responsive interfaces, and implementation. The portfolio includes business websites, WordPress publishing tools, and custom Next.js applications, with each project labeled by its actual status.</p>
      </RouteSection>
      <RouteSection title="How we shape the work">
        <ol>
          <li><strong>Understand the brief.</strong> Discuss your audience, current website, business priorities, and required functionality.</li>
          <li><strong>Define the scope.</strong> Agree on the pages, content, design direction, integrations, and responsibilities.</li>
          <li><strong>Design and build.</strong> Develop the experience around real content and review the important journeys together.</li>
          <li><strong>Review and hand off.</strong> Check the agreed functionality, mobile layouts, and launch requirements, then clarify ongoing ownership.</li>
        </ol>
      </RouteSection>
      <RouteSection title="See the work behind the services">
        <p>Explore the <Link href="/projects/barber-refinery">Barber Refinery website design</Link>, the <Link href="/projects/first-medical-associates">First Medical Associates patient experience</Link>, or the <Link href="/projects/estate-sales-bakersfield">Estate Sales Bakersfield web application</Link>.</p>
      </RouteSection>
      <RouteSection title="What to bring to a first conversation">
        <p>Share your current website if you have one, what you want to improve, the pages or functionality you need, and any timing or budget constraints. Branding, photography, and draft content are useful starting points.</p>
        <p>Project pricing, schedules, hosting, third-party costs, and maintenance depend on the agreed scope. We will discuss those details for your project.</p>
        <Link className="route-action route-action--primary" href="/contact">Start a website conversation</Link>
      </RouteSection>
    </RouteDocument>
  );
}
