import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CaseStudyComparison,
  CaseStudyIndex,
  CaseStudyNote,
  CaseStudySection,
  CaseStudyVisual,
} from "@/components/projects/CaseStudy";

describe("CaseStudy components", () => {
  it("renders a linked section index and complete semantic section", () => {
    render(
      <>
        <CaseStudyIndex items={[{ id: "overview", label: "Overview" }]} />
        <CaseStudySection id="overview" number="01" title="Overview">
          <p>Route-backed content.</p>
        </CaseStudySection>
      </>,
    );

    expect(
      screen.getByRole("navigation", { name: "Case study sections" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "#overview",
    );
    expect(screen.getByRole("heading", { name: "Overview", level: 2 })).toBeVisible();
  });

  it("keeps process visuals and evidence notes accessible as content", () => {
    render(
      <>
        <CaseStudyVisual
          caption="A proposed flow."
          items={[{ title: "Discover", detail: "Find an event.", status: "Proposed" }]}
          title="Buyer flow"
        />
        <CaseStudyComparison
          caption="Shared facts, different views."
          items={[{ title: "Pocket", detail: "Focused presentation." }]}
          title="Shells"
        />
        <CaseStudyNote label="Evidence boundary">
          <p>No launch claim.</p>
        </CaseStudyNote>
      </>,
    );

    expect(screen.getByRole("heading", { name: "Buyer flow", level: 3 })).toBeVisible();
    expect(screen.getByText("A proposed flow.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Pocket", level: 4 })).toBeVisible();
    expect(screen.getByText("No launch claim.")).toBeVisible();
  });
});
