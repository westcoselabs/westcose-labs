import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: "About",
  description: "About WestCose Labs and the portfolio operating system.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <RouteDocument
      eyebrow="System information"
      title="About WestCose Labs"
      description="A professional portfolio imagined as a fictional personal workstation from an alternate 2009."
      actions={[
        { href: "/projects", label: "Browse projects", variant: "primary" },
        { href: "/contact", label: "Get in touch" },
      ]}
    >
      <RouteSection title="The idea">
        <p>
          Desktop OS gives pointer-oriented visitors a calm creative workstation.
          Pocket OS makes the same portfolio touch-first. Normal View keeps every
          essential route in conventional document flow. The route chooses the
          content; the shell only changes its presentation.
        </p>
      </RouteSection>
      <RouteSection title="The design language">
        <p>
          Matte graphite surfaces, upper-left lighting, restrained system blue,
          photographic wallpaper, and sparse chrome create a tactile soft-tech
          interface without cloning an existing operating system.
        </p>
      </RouteSection>
      <RouteSection title="Links" id="links">
        {siteConfig.githubUrl ? (
          <p>
            <a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">
              Open the verified GitHub profile
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ) : (
          <p className="configuration-note">
            The production GitHub destination is awaiting owner configuration.
            No placeholder profile is linked.
          </p>
        )}
        {siteConfig.socials.length === 0 ? (
          <p className="configuration-note">
            Social shortcuts will appear only after their active destinations are
            verified.
          </p>
        ) : null}
      </RouteSection>
    </RouteDocument>
  );
}
