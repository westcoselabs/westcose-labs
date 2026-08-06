import type { ReactNode } from "react";

export function DevelopmentFixture({ children }: { children: ReactNode }) {
  return (
    <aside className="development-fixture" aria-labelledby="fixture-heading">
      <p className="development-fixture__label" id="fixture-heading">
        Development fixture
      </p>
      <div>{children}</div>
    </aside>
  );
}
