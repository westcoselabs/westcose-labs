import { ServicesShowcase } from "@/components/services/ServicesShowcase";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Website Design & Development Services",
  description: "Explore custom website design and web development from WestCose Labs. See relevant projects, learn about the process, and discuss your business needs.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesShowcase />;
}
