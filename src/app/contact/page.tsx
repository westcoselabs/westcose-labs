import { ContactComposer } from "@/components/apps/ContactComposer";
import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Discuss Your Website Project",
  description: "Contact WestCose Labs about website design, custom web development, or a redesign. Share your business goals, current website, and project requirements.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <RouteDocument
      eyebrow="Start a conversation"
      title="Let’s talk about your website"
      description="Tell us about your business, your current website, and what you want to build or improve. Include any timing, budget, and content requirements that will help shape the project."
      status={
        siteConfig.contactEmailConfigured
          ? "Email handoff ready"
          : "Email address awaiting configuration"
      }
      presentation="contact"
    >
      <RouteSection title="Compose an email">
        <ContactComposer recipient={siteConfig.contactEmail} />
        {siteConfig.contactEmail ? (
          <p>
            Prefer a direct link?{" "}
            <a href={`mailto:${siteConfig.contactEmail}`}>
              Email {siteConfig.contactEmail}
            </a>
            .
          </p>
        ) : null}
      </RouteSection>
      <RouteSection title="Phone actions">
        <div className="contact-actions">
          <a
            className="route-action route-action--primary"
            href={`sms:${siteConfig.phoneE164}`}
          >
            Text {siteConfig.phoneDisplay}
          </a>
          <a
            className="route-action route-action--secondary"
            href={`tel:${siteConfig.phoneE164}`}
          >
            Call {siteConfig.phoneDisplay}
          </a>
        </div>
        <p>
          These links ask your device to open its Messages or Phone application.
          The website does not claim that a message was sent or a call was placed.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
