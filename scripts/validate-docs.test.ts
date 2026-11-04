import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  CAPS,
  HEADINGS,
  countWords,
  firstRepeat,
  splitSections,
  validate,
} from "./validate-docs.ts";

const CAP = CAPS["PRODUCT.md"].sections;
const SYS = CAPS["SYSTEMS.md"].sections;

function words(count: number, prefix: string): string {
  return Array.from({ length: count }, (_, i) => `${prefix}${i}`).join(" ");
}

function product(over: Record<string, string> = {}): string {
  const body = (heading: string, text: string) => over[heading] ?? text;
  return [
    "# Product",
    "",
    "## Problem",
    body("Problem", words(CAP.Problem, "prob")),
    "",
    "## Scope",
    body("Scope", words(CAP.Scope, "scope")),
    "",
    "## Behaviour",
    body("Behaviour", words(CAP.Behaviour, "behav")),
    "",
    "## Autonomy",
    body("Autonomy", words(CAP.Autonomy, "auto")),
    "",
    "## Vision",
    body("Vision", words(CAP.Vision, "vision")),
    "",
    "## Acceptance",
    body("Acceptance", words(CAP.Acceptance, "accept")),
    "",
  ].join("\n");
}

function systems(over: Record<string, string> = {}): string {
  const body = (heading: string, text: string) => over[heading] ?? text;
  return [
    "# System",
    "",
    "## Architecture",
    body("Architecture", words(SYS.Architecture, "arch")),
    "",
    "## Dependencies",
    body("Dependencies", words(SYS.Dependencies, "dep")),
    "",
    "## Failure modes",
    body("Failure modes", words(SYS["Failure modes"], "fail")),
    "",
  ].join("\n");
}

function fixture(productText: string, systemsText: string): string {
  const dir = mkdtempSync(join(tmpdir(), "validate-docs-"));
  writeFileSync(join(dir, "PRODUCT.md"), productText);
  writeFileSync(join(dir, "SYSTEMS.md"), systemsText);
  return dir;
}

describe("validate", () => {
  test("a conforming pair passes", () => {
    expect(validate(fixture(product(), systems())).errors).toEqual([]);
  });

  test("a directory with neither document passes", () => {
    const dir = mkdtempSync(join(tmpdir(), "validate-docs-"));
    expect(validate(dir)).toEqual({ errors: [], checked: [] });
  });

  test("a pair under docs/ passes", () => {
    const dir = mkdtempSync(join(tmpdir(), "validate-docs-"));
    mkdirSync(join(dir, "docs"));
    writeFileSync(join(dir, "docs", "PRODUCT.md"), product());
    writeFileSync(join(dir, "docs", "SYSTEMS.md"), systems());
    expect(validate(dir).errors).toEqual([]);
  });

  test("a link under docs/ resolves beside the document", () => {
    const dir = mkdtempSync(join(tmpdir(), "validate-docs-"));
    mkdirSync(join(dir, "docs"));
    writeFileSync(
      join(dir, "docs", "PRODUCT.md"),
      product({ Scope: `${words(5, "scope")} [the system](SYSTEMS.md)` }),
    );
    writeFileSync(join(dir, "docs", "SYSTEMS.md"), systems());
    expect(validate(dir).errors).toEqual([]);
  });

  test("require fails a directory with no pair", () => {
    const dir = mkdtempSync(join(tmpdir(), "validate-docs-"));
    expect(validate(dir, { require: true }).errors).toEqual([
      "PRODUCT.md: not found",
      "SYSTEMS.md: not found",
    ]);
  });

  test("require passes a conforming pair", () => {
    const dir = fixture(product(), systems());
    expect(validate(dir, { require: true }).errors).toEqual([]);
  });

  test("one word over a cap names the section and the number", () => {
    const dir = fixture(
      product({ Behaviour: words(CAP.Behaviour + 1, "behav") }),
      systems(),
    );
    expect(validate(dir).errors).toContain(
      `PRODUCT.md § Behaviour: ${CAP.Behaviour + 1} words, cap ${CAP.Behaviour}`,
    );
  });

  test("a missing heading is named", () => {
    const text = product().replace("## Vision", "## Outlook");
    expect(validate(fixture(text, systems())).errors).toContain(
      "PRODUCT.md: missing heading ## Vision",
    );
  });

  test("an unknown heading is named", () => {
    const text = product().replace("## Vision", "## Outlook");
    expect(validate(fixture(text, systems())).errors).toContain(
      "PRODUCT.md: unknown heading ## Outlook",
    );
  });

  test("a duplicate heading is named", () => {
    const text = product() + "\n## Vision\n" + words(3, "again");
    expect(validate(fixture(text, systems())).errors).toContain(
      "PRODUCT.md: duplicate heading ## Vision",
    );
  });

  test("headings out of order fail", () => {
    const text = product()
      .replace("## Vision", "## TEMP")
      .replace("## Scope", "## Vision")
      .replace("## TEMP", "## Scope");
    expect(validate(fixture(text, systems())).errors).toContain(
      "PRODUCT.md: headings are out of order",
    );
  });

  test("a section with no text fails", () => {
    const dir = fixture(product({ Vision: "" }), systems());
    expect(validate(dir).errors).toContain("PRODUCT.md § Vision: no text");
  });

  test("a section holding only a comment, a fence or a table rule has no text", () => {
    const empty = ["<!-- none yet -->", "```\nthe plan\n```", "| --- | --- |"];
    for (const body of empty) {
      const dir = fixture(product({ Vision: body }), systems());
      expect(validate(dir).errors).toContain("PRODUCT.md § Vision: no text");
    }
  });

  test("None is text", () => {
    expect(
      validate(fixture(product({ Vision: "None" }), systems())).errors,
    ).toEqual([]);
  });

  test("a relative link that does not resolve fails", () => {
    const dir = fixture(
      product({ Scope: `${words(5, "scope")} [the plan](PLAN.md)` }),
      systems(),
    );
    expect(validate(dir).errors).toContain(
      "PRODUCT.md: PLAN.md does not resolve",
    );
  });

  test("a relative link that resolves passes", () => {
    const dir = fixture(
      product({ Scope: `${words(5, "scope")} [the system](SYSTEMS.md)` }),
      systems(),
    );
    expect(validate(dir).errors).toEqual([]);
  });

  test("twelve shared words fail", () => {
    const shared =
      "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima";
    const dir = fixture(
      product({ Problem: shared }),
      systems({ Architecture: shared }),
    );
    const found = validate(dir).errors.join("\n");
    expect(found).toContain("twelve words repeat");
    expect(found).toContain("alpha bravo charlie");
  });

  test("eleven shared words pass", () => {
    const shared =
      "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo";
    const dir = fixture(
      product({ Problem: shared }),
      systems({ Architecture: shared }),
    );
    expect(validate(dir).errors).toEqual([]);
  });
});

describe("countWords", () => {
  test("counts prose and list text", () => {
    expect(countWords("one two three\n\n- four five")).toBe(5);
  });

  test("counts table cells and not the table rule", () => {
    expect(countWords("| a | b |\n| --- | --- |\n| c | d |")).toBe(4);
  });

  test("does not count a fenced block", () => {
    expect(countWords("one two\n\n```\nthree four five\n```\n")).toBe(2);
  });

  test("does not count a nested heading", () => {
    expect(countWords("### A heading\none two")).toBe(2);
  });

  test("counts a link by its text and not its target", () => {
    expect(countWords("[the plan](PLAN-with-a-long-name.md) now")).toBe(3);
  });

  test("does not count an HTML comment", () => {
    expect(countWords("one <!-- two three --> four")).toBe(2);
  });
});

describe("splitSections", () => {
  test("ignores a heading inside a fence", () => {
    const sections = splitSections("## One\n```\n## Two\n```\n");
    expect(sections.map((section) => section.heading)).toEqual(["One"]);
  });
});

describe("firstRepeat", () => {
  test("finds a run of twelve words", () => {
    const run = "a b c d e f g h i j k l";
    expect(firstRepeat(`x ${run}`, `y ${run}`)).toBe(run);
  });

  test("ignores case and punctuation", () => {
    expect(
      firstRepeat(
        "Alpha, bravo; charlie delta echo foxtrot golf hotel india juliet kilo lima.",
        "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima",
      ),
    ).toBe(
      "alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima",
    );
  });
});

describe("the standard", () => {
  const standard = readFileSync(
    resolve(import.meta.dir, "../docs/DOCUMENTS.md"),
    "utf8",
  );

  test("every cap in the tables is the script's cap", () => {
    const found = new Map<string, number>();
    for (const match of standard.matchAll(
      /^\|\s*`## ([^`]+)`\s*\|\s*(\d+)\s*\|/gm,
    )) {
      found.set(match[1] ?? "", Number(match[2]));
    }
    const expected = new Map<string, number>();
    for (const doc of ["PRODUCT.md", "SYSTEMS.md"] as const) {
      for (const [heading, cap] of Object.entries(CAPS[doc].sections)) {
        expected.set(heading, cap);
      }
    }
    expect(found).toEqual(expected);
  });

  test("each total is the sum of its caps", () => {
    for (const doc of ["PRODUCT.md", "SYSTEMS.md"] as const) {
      const sum = Object.values(CAPS[doc].sections).reduce((a, b) => a + b, 0);
      expect(sum).toBe(CAPS[doc].total);
      expect(standard).toContain(`Total: ${CAPS[doc].total} words.`);
    }
  });

  test("names every heading the script expects", () => {
    for (const doc of ["PRODUCT.md", "SYSTEMS.md"] as const) {
      for (const heading of HEADINGS[doc]) {
        expect(standard).toContain(`\`## ${heading}\``);
      }
    }
  });
});
