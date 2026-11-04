/**
 * Check PRODUCT.md and SYSTEMS.md against docs/DOCUMENTS.md.
 *
 *   bun run validate-docs          the current directory
 *   bun run validate-docs <dir>    the named directory
 *
 * Exit 0 when every document passes and 1 when one fails. A directory with
 * neither document passes: not every repository carries them.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

type DocName = "PRODUCT.md" | "SYSTEMS.md";

const DOCS: readonly DocName[] = ["PRODUCT.md", "SYSTEMS.md"];

export const HEADINGS: Record<DocName, readonly string[]> = {
  "PRODUCT.md": [
    "Problem",
    "Scope",
    "Behaviour",
    "Autonomy",
    "Vision",
    "Acceptance",
  ],
  "SYSTEMS.md": ["Architecture", "Dependencies", "Failure modes"],
};

export const CAPS = {
  "PRODUCT.md": {
    total: 600,
    sections: {
      Problem: 90,
      Scope: 110,
      Behaviour: 250,
      Autonomy: 50,
      Vision: 40,
      Acceptance: 60,
    },
  },
  "SYSTEMS.md": {
    total: 300,
    sections: { Architecture: 180, Dependencies: 40, "Failure modes": 80 },
  },
} as const;

/** The number of consecutive words both documents may not share. */
const REPEAT = 12;

const FENCE = /^\s*(```|~~~)/;
const SECTION = /^##\s+(.+?)\s*$/;
const LINK = /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IMAGE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export interface Section {
  heading: string;
  body: string;
}

/** Split a document into its level-two sections, ignoring fenced code. */
export function splitSections(text: string): Section[] {
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
export function countWords(body: string): number {
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

/** Lowercase words with punctuation removed, in source order. */
function words(body: string): string[] {
  const text = stripFences(body)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(IMAGE, "$1")
    .replace(LINK, "$1");
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter((word) => word.length > 0);
}

/** The first run of REPEAT words that both documents carry. */
export function firstRepeat(a: string, b: string): string | undefined {
  const left = words(a);
  const right = new Set<string>();
  const other = words(b);
  for (let i = 0; i + REPEAT <= other.length; i += 1) {
    right.add(other.slice(i, i + REPEAT).join(" "));
  }
  for (let i = 0; i + REPEAT <= left.length; i += 1) {
    const phrase = left.slice(i, i + REPEAT).join(" ");
    if (right.has(phrase)) return phrase;
  }
  return undefined;
}

/** Check one directory. Returns the findings, each ready to print. */
export function validate(dir: string): {
  errors: string[];
  checked: DocName[];
} {
  const errors: string[] = [];
  const checked: DocName[] = [];
  const bodies = new Map<DocName, string>();

  for (const name of DOCS) {
    const path = resolve(dir, name);
    if (!existsSync(path) || !statSync(path).isFile()) continue;
    checked.push(name);
    const text = readFileSync(path, "utf8");
    bodies.set(name, text);
    errors.push(...checkFile(name, path, text));
  }

  if (bodies.size === 2) {
    const repeat = firstRepeat(
      bodies.get("PRODUCT.md") ?? "",
      bodies.get("SYSTEMS.md") ?? "",
    );
    if (repeat) {
      errors.push(
        `PRODUCT.md and SYSTEMS.md: twelve words repeat: "${repeat}"`,
      );
    }
  }

  return { errors, checked };
}

function checkFile(name: DocName, path: string, text: string): string[] {
  const errors: string[] = [];
  const expected = HEADINGS[name];
  const caps = CAPS[name];
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

  for (const section of sections) {
    const cap = (caps.sections as Record<string, number>)[section.heading];
    if (cap === undefined) continue;
    const count = countWords(section.body);
    if (section.body.trim().length === 0) {
      errors.push(`${name} § ${section.heading}: no text`);
    } else if (count > cap) {
      errors.push(`${name} § ${section.heading}: ${count} words, cap ${cap}`);
    }
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
  const dir = resolve(process.argv[2] ?? ".");
  const { errors, checked } = validate(dir);
  for (const error of errors) console.error(error);
  if (errors.length > 0) process.exit(1);
  console.log(
    checked.length === 0
      ? "validate-docs: no documents here"
      : `validate-docs: ${checked.join(" and ")} pass`,
  );
}
