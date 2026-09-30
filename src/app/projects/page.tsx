import { ProjectShowcase } from "@/components/projects/ProjectShowcase";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Website Design Portfolio & Software Projects",
  description:
    "Explore client websites, original software, publishing tools, and playable worlds designed and built by WestCose.",
  path: "/projects",
});

export default function ProjectsPage() {
  return <ProjectShowcase />;
}
