import { ServicesShowcase } from "@/components/services/ServicesShowcase";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Websites, Web Apps & Creative Development",
  description: "Custom website design, web development, tools, integrations, and interactive projects by WestCose Labs in Bakersfield, California.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesShowcase />;
}
