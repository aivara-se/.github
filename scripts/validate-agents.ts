/**
 * Check that a repository's AGENTS.md is the organisation's entry file.
 *
 *   bun run validate-agents
 *   bun run validate-agents --canon <path> --entry <path>
 *
 * Exit 0 when the two files are identical and 1 when they differ, when either
 * is missing, or when the entry file still carries a `{{slot}}`.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SLOT = /\{\{[A-Z_]+\}\}/;

/** The first line at which two texts differ, or undefined when they match. */
export function firstDifference(
  canon: string,
  entry: string,
): string | undefined {
  if (canon === entry) return undefined;
  const left = canon.split("\n");
  const right = entry.split("\n");
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    if (left[i] !== right[i]) {
      return `line ${i + 1}: the standard has ${JSON.stringify(left[i] ?? "no line")}, the entry file has ${JSON.stringify(right[i] ?? "no line")}`;
    }
  }
  return "the files differ";
}

/** The findings for one pair, each ready to print. */
export function validate(canonPath: string, entryPath: string): string[] {
  if (!existsSync(canonPath)) return [`${canonPath}: the standard is missing`];
  if (!existsSync(entryPath)) return [`${entryPath}: not found`];
  const entry = readFileSync(entryPath, "utf8");
  const slot = SLOT.exec(entry);
  if (slot) return [`${entryPath}: unfilled slot ${slot[0]}`];
  const difference = firstDifference(readFileSync(canonPath, "utf8"), entry);
  if (difference === undefined) return [];
  return [
    `${entryPath}: not the organisation's entry file — ${difference}`,
    `Copy ${canonPath} unchanged; do not edit the copy.`,
  ];
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const value = (flag: string, fallback: string): string => {
    const index = args.indexOf(flag);
    return index === -1 ? fallback : (args[index + 1] ?? fallback);
  };
  const canon = resolve(value("--canon", "docs/ENTRY.md"));
  const entry = resolve(value("--entry", "AGENTS.md"));
  const errors = validate(canon, entry);
  for (const error of errors) console.error(error);
  if (errors.length > 0) process.exit(1);
  console.log(`validate-agents: ${entry} matches ${canon}`);
}
