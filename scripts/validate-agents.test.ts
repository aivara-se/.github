import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { validate } from "./validate-agents";

const CANON = resolve(import.meta.dir, "../docs/ENTRY.md");
const ENTRY = resolve(import.meta.dir, "../AGENTS.md");

/** A canon and an entry file in a temporary directory. */
function pair(canon: string, entry: string): [string, string] {
  const dir = mkdtempSync(join(tmpdir(), "validate-agents-"));
  const left = join(dir, "ENTRY.md");
  const right = join(dir, "AGENTS.md");
  writeFileSync(left, canon);
  writeFileSync(right, entry);
  return [left, right];
}

describe("the entry file", () => {
  test("this repository's copy is the standard", () => {
    expect(validate(CANON, ENTRY)).toEqual([]);
  });

  test("names the first differing line", () => {
    const [canon, entry] = pair("# A\none\n", "# A\ntwo\n");
    expect(validate(canon, entry)[0]).toContain("line 2");
  });

  test("fails a missing entry file", () => {
    const missing = resolve(import.meta.dir, "absent.md");
    expect(validate(CANON, missing)[0]).toContain("not found");
  });

  test("fails a missing standard", () => {
    const missing = resolve(import.meta.dir, "absent.md");
    expect(validate(missing, ENTRY)[0]).toContain("standard is missing");
  });

  test("fails an unfilled slot", () => {
    const [canon, entry] = pair("# A\n", "# A\n{{REPO_PURPOSE}}\n");
    expect(validate(canon, entry)[0]).toContain("unfilled slot");
  });

  test("fails a missing final newline", () => {
    const [canon, entry] = pair("# A\n", "# A");
    expect(validate(canon, entry).length).toBeGreaterThan(0);
  });
});
