import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { DoNotOpen } from "@/components/apps/DoNotOpen";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Recycle",
  description: "A harmless archive of nonessential WestCose Labs material.",
  path: "/recycle",
});

const recycledFiles = [
  {
    name: "final-final-v7-actually-final.fig",
    note: "Modified continuously since the phrase ‘quick revision.’",
  },
  {
    name: "weekend-project-437-days-running.log",
    note: "Background task healthy. Definition of healthy unavailable.",
  },
  {
    name: "meeting-that-could-have-been-a-readme.txt",
    note: "Recovered successfully. It is now a README.",
  },
] as const;

export default function RecyclePage() {
  return (
    <RouteDocument
      eyebrow="Archive / nonessential"
      title="Recycle"
      description="A few joke files and side-project sediment. No essential portfolio content is hidden here."
      status={`${recycledFiles.length} harmless files`}
    >
      <RouteSection title="Recovered files">
        <ul className="file-list">
          {recycledFiles.map((file) => (
            <li key={file.name}>
              <strong>{file.name}</strong>
              <span>{file.note}</span>
            </li>
          ))}
        </ul>
      </RouteSection>
      <RouteSection title="Quarantined item">
        <p>This interaction is optional, harmless, and easy to dismiss.</p>
        <DoNotOpen />
      </RouteSection>
    </RouteDocument>
  );
}
