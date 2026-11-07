import { ContactComposer } from "@/components/apps/ContactComposer";
import { RouteDocument } from "@/components/apps/RouteDocument";
import { createRouteMetadata, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Discuss Your Website Project",
  description: "Contact Brandon at WestCose Labs about website design, custom development, or a redesign. Share your idea and start a direct conversation.",
  path: "/contact",
});

export default function ContactPage() {
  return <RouteDocument eyebrow="DROP ME A LINE" title="What have you got in mind?" description="A new website, a useful tool, or something a little harder to explain. Let’s talk it through." presentation="contact">
    <ContactComposer recipient={siteConfig.contactEmail} />
  </RouteDocument>;
}
