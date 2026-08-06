import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata } from "@/registry";

export const metadata = createRouteMetadata({
  title: "Terminal",
  description: "A small WestCose Labs command utility and command reference.",
  path: "/terminal",
});

export default function TerminalPage() {
  return (
    <RouteDocument
      eyebrow="Utility"
      title="Terminal"
      description="The Desktop shell may provide an interactive utility window. This route is the conventional command reference and Pocket fallback."
    >
      <RouteSection title="Available commands">
        <dl className="command-list">
          <div>
            <dt>
              <code>help</code>
            </dt>
            <dd>List supported commands and keyboard controls.</dd>
          </div>
          <div>
            <dt>
              <code>projects</code>
            </dt>
            <dd>Navigate to the project directory.</dd>
          </div>
          <div>
            <dt>
              <code>about</code>
            </dt>
            <dd>Open system information.</dd>
          </div>
          <div>
            <dt>
              <code>clear</code>
            </dt>
            <dd>Clear the utility&apos;s local output.</dd>
          </div>
        </dl>
      </RouteSection>
      <RouteSection title="Safety boundary">
        <p>
          Commands are a navigation interface, not a system shell. They cannot
          execute arbitrary code, access your files, or imitate permissions.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
