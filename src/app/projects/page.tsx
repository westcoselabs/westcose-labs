import { ProjectCard } from "@/components/apps/ProjectCard";
import {
  RouteCardGrid,
  RouteDocument,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, projectRegistry } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Projects",
  description: "Selected WestCose Labs software and web work.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <RouteDocument
      eyebrow="Work directory"
      title="Projects"
      description="Selected software and web work. Development fixtures are labeled until their production facts and assets are approved."
      status={`${projectRegistry.length} project files`}
      presentation="projects"
    >
      <RouteCardGrid>
        {projectRegistry.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </RouteCardGrid>
    </RouteDocument>
  );
}
