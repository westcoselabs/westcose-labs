import Link from "next/link";

import { RouteDocument, RouteSection } from "@/components/apps/RouteDocument";

export default function NotFound() {
  return (
    <RouteDocument
      eyebrow="Error 404"
      title="This file is not on the workstation"
      description="The route may have moved, or it may belong to a deferred app that is not part of V1."
      actions={[
        { href: "/", label: "Return home", variant: "primary" },
        { href: "/projects", label: "Browse projects" },
      ]}
    >
      <RouteSection title="Available directories">
        <p>
          Try <Link href="/projects">Projects</Link>,{" "}
          <Link href="/games">Games</Link>,{" "}
          <Link href="/experiments">Experiments</Link>, or{" "}
          <Link href="/about">About</Link>.
        </p>
      </RouteSection>
    </RouteDocument>
  );
}
