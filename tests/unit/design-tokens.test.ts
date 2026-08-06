import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function findCssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findCssFiles(path);
    return entry.isFile() && entry.name.endsWith(".css") ? [path] : [];
  });
}

const productCssFiles = ["src/app", "src/components"].flatMap((directory) =>
  findCssFiles(join(process.cwd(), directory)),
);

describe("design-token contract", () => {
  it("keeps raw colors out of component styles", () => {
    const offenders = productCssFiles.filter((file) =>
      /#[0-9a-f]{3,8}\b/iu.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps component radii on documented tokens", () => {
    const offenders = productCssFiles.flatMap((file) => {
      const matches = readFileSync(file, "utf8").matchAll(
        /border-radius:\s*([^;]+);/giu,
      );
      return Array.from(matches)
        .map((match) => match[1]?.trim() ?? "")
        .filter((value) => !value.startsWith("var(") && value !== "inherit")
        .map((value) => `${file}: ${value}`);
    });
    expect(offenders).toEqual([]);
  });

  it("contains the locked pressed-blue token", () => {
    const tokens = readFileSync(
      join(process.cwd(), "src/styles/tokens.css"),
      "utf8",
    );
    expect(tokens).toContain("--color-primary-pressed: #3269b3;");
  });
});
