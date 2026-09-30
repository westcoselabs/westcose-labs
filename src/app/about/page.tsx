import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import {
  createRouteMetadata,
  siteConfig,
  systemFacts,
} from "@/registry";

export const metadata = createRouteMetadata({
  title: "About Our Website Design & Development Work",
  description: "Meet WestCose Labs, a Bakersfield-based design and development practice. Explore the approach behind our custom websites, software, and creative projects.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <RouteDocument
      eyebrow="About this device"
      title="Website design and development at WestCose Labs"
      description="A design-led practice based in Bakersfield, California, bringing custom websites, software, and creative development together."
      presentation="about"
      actions={[
        { href: "/projects", label: "View projects", variant: "primary" },
        { href: "/contact", label: "Contact" },
      ]}
    >
      <section className="system-information" aria-label="System information">
        {systemFacts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
            {"detail" in fact && fact.detail ? <small>{fact.detail}</small> : null}
          </div>
        ))}
      </section>
      <RouteSection title="Design language">
        <p>
          Matte graphite, upper-left lighting, restrained system blue, local
          photography, and sparse chrome create a tactile soft-tech interface
          without copying an existing operating system.
        </p>
      </RouteSection>
      <RouteSection title="Verified links" id="links">
        {siteConfig.githubUrl ? (
          <p><a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">Open GitHub profile<span className="sr-only"> (opens in a new tab)</span></a></p>
        ) : (
          <p className="configuration-note">The production GitHub destination still needs owner configuration.</p>
        )}
        {siteConfig.socials.length === 0 ? (
          <p className="configuration-note">Social shortcuts remain hidden until their destinations are verified.</p>
        ) : null}
      </RouteSection>
    </RouteDocument>
  );
}
