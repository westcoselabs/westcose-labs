import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import { createRouteMetadata, noteRegistry } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Notes",
  description: "README and process notes for WestCose Labs OS.",
  path: "/notes",
});

export default function NotesPage() {
  return <NotesRoute notes={noteRegistry} />;
}
