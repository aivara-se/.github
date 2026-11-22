/**
 * Check docs/SPEC8N.md against the document standard.
 *
 *   bun run validate-docs          the current directory
 *   bun run validate-docs <dir>    the named directory
 *   --require                      fail when the document is absent
 *
 * Exit 0 when the document passes and 1 when it fails. A directory with no
 * SPEC8N.md passes: not every repository carries one. The document is read from
 * the root or from `docs/`; the root wins when both carry a copy.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

const DOCS = ["SPEC8N.md"] as const;

const HEADINGS: Record<string, readonly string[]> = {
  "SPEC8N.md": ["Direction", "Requirements", "Architecture"],
};

/** The most words the whole document may hold. */
const CAP = 500;

const FENCE = /^\s*(```|~~~)/;
const SECTION = /^##\s+(.+?)\s*$/;
const LINK = /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

interface Section {
  heading: string;
  body: string;
}

/** Split a document into its level-two sections, ignoring fenced code. */
function splitSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | undefined;
  let fenced = false;
  for (const line of text.split("\n")) {
    if (FENCE.test(line)) {
      fenced = !fenced;
    }
    if (!fenced) {
      const match = SECTION.exec(line);
      if (match) {
        current = { heading: match[1] ?? "", body: "" };
        sections.push(current);
        continue;
      }
    }
    if (current) current.body += line + "\n";
  }
  return sections;
}

/** Remove fenced code blocks, keeping the blank line that separates them. */
function stripFences(text: string): string {
  const kept: string[] = [];
  let fenced = false;
  for (const line of text.split("\n")) {
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced) kept.push(line);
  }
  return kept.join("\n");
}

/**
 * The words of a section: prose, list text and table cells. A heading, fenced
 * code, link target, HTML comment and table rule do not count.
 */
function countWords(body: string): number {
  let text = stripFences(body);
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/^#{1,6}\s+.*$/gm, " ");
  text = text.replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, " ");
  text = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, " ");
  text = text.replace(IMAGE, "$1");
  text = text.replace(LINK, "$1");
  text = text.replace(/\|/g, " ");
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/** The repositories keep the document at the root or under `docs/`; root wins. */
function findDoc(dir: string, name: string): string | undefined {
  for (const candidate of [resolve(dir, name), resolve(dir, "docs", name)]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

/** Check one directory. Returns the findings, each ready to print. */
function validate(
  dir: string,
  options: { require?: boolean } = {},
): {
  errors: string[];
  checked: string[];
} {
  const errors: string[] = [];
  const checked: string[] = [];
  for (const name of DOCS) {
    const path = findDoc(dir, name);
    if (path === undefined) continue;
    checked.push(name);
    errors.push(...checkFile(name, path, readFileSync(path, "utf8")));
  }
  if (options.require) {
    for (const name of DOCS) {
      if (!checked.includes(name)) errors.push(`${name}: not found`);
    }
  }
  return { errors, checked };
}

function checkFile(name: string, path: string, text: string): string[] {
  const errors: string[] = [];
  const expected = HEADINGS[name] ?? [];
  const sections = splitSections(text);
  const names = sections.map((section) => section.heading);
  for (const heading of expected) {
    if (!names.includes(heading)) {
      errors.push(`${name}: missing heading ## ${heading}`);
    }
  }
  for (const heading of names) {
    if (!expected.includes(heading)) {
      errors.push(`${name}: unknown heading ## ${heading}`);
    }
  }
  const seen = new Set<string>();
  for (const heading of names) {
    if (seen.has(heading)) {
      errors.push(`${name}: duplicate heading ## ${heading}`);
    }
    seen.add(heading);
  }
  const present = names.filter((heading) => expected.includes(heading));
  const wanted = expected.filter((heading) => present.includes(heading));
  if (present.join("\u0000") !== wanted.join("\u0000")) {
    errors.push(`${name}: headings are out of order`);
  }
  let total = 0;
  for (const section of sections) {
    const count = countWords(section.body);
    total += count;
    if (count === 0) {
      errors.push(`${name} § ${section.heading}: no text`);
    }
  }
  if (total > CAP) {
    errors.push(`${name}: ${total} words, cap ${CAP}`);
  }
  for (const match of text.matchAll(LINK)) {
    const target = match[2] ?? "";
    if (target.length === 0 || SCHEME.test(target) || target.startsWith("#")) {
      continue;
    }
    const clean = target.split("#")[0] ?? "";
    if (clean.length === 0) continue;
    const resolved = isAbsolute(clean) ? clean : resolve(dirname(path), clean);
    if (!existsSync(resolved)) {
      errors.push(`${name}: ${target} does not resolve`);
    }
  }
  return errors;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const require = args.includes("--require");
  const dir = resolve(args.find((arg) => !arg.startsWith("--")) ?? ".");
  const { errors, checked } = validate(dir, { require });
  for (const error of errors) console.error(error);
  if (errors.length > 0) process.exit(1);
  console.log(
    checked.length === 0
      ? "validate-docs: no documents here"
      : `validate-docs: ${checked.join(" and ")} pass`,
  );
}
