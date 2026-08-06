import { ContactComposer } from "@/components/apps/ContactComposer";
import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Contact",
  description: "Contact WestCose Labs by native email, text, or phone handoff.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <RouteDocument
      eyebrow="Native handoff"
      title="Contact"
      description="Start a conversation without creating an account or sending form data to this website."
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
