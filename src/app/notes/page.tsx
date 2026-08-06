import { NotesExplorer } from "@/components/apps/NotesExplorer";
import { RouteDocument } from "@/components/apps/RouteDocument";
import { createRouteMetadata, noteRegistry } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Notes",
  description: "README and process notes for WestCose Labs OS.",
  path: "/notes",
});

export default function NotesPage() {
  return (
    <RouteDocument
      eyebrow="Notes"
      title="Working notes"
      description="Professional process notes, system orientation, and a few clearly labeled jokes."
      status={`${noteRegistry.length} notes`}
      presentation="notes"
    >
      <NotesExplorer notes={noteRegistry} />
    </RouteDocument>
  );
}
