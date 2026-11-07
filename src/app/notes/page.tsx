import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import { createRouteMetadata, noteRegistry } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Notes",
  description: "Build notes, design decisions, and unfinished ideas from the WestCose Labs workbench.",
  path: "/notes",
});

export default function NotesPage() {
  return <NotesRoute notes={noteRegistry} />;
}
