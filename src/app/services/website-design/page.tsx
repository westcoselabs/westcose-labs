import { ServicePage } from "@/components/services/ServicePage";
import { createRouteMetadata } from "@/registry/metadata";
import { serviceRegistry } from "@/registry/services";

const service = serviceRegistry[0];
export const metadata = createRouteMetadata({ title: service.title, description: service.description, path: `/services/${service.slug}` });
export default function WebsiteDesignPage() {
  return <ServicePage service={service} />;
}
