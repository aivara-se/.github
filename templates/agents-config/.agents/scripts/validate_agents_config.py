#!/usr/bin/env python3
"""Check this repository's agent configuration against the aivara-se convention.

Usage:
    python3 .agents/scripts/validate_agents_config.py [--template] [root]

    --template   allow unresolved placeholders. Used inside aivara-se/.github itself, where
                 the convention ships with its slots unfilled; the surviving slots are listed.
    root         repository root to check; defaults to the current working directory.

Checks:

    1. AGENTS.md exists at the repository root.
    2. Every skill named in AGENTS.md exists on disk, and every skill on disk is named in
       AGENTS.md — the index cannot go stale in either direction.
    3. Each .agents/skills/**/SKILL.md declares name, description and when-to-use in its YAML
       front matter, and its name matches the directory it lives in.
    4. Every relative path referenced from AGENTS.md or from a skill resolves.
    5. No unresolved slot remains in AGENTS.md or under .agents/ (the scripts directory is
       exempt: looking for slots is its job), unless --template is given.
    6. .agents/config.yml declares the keys the convention reads.

Exit status is 0 when every check passes, 1 otherwise. This file is part of the copied tree
on purpose: run it whenever AGENTS.md, a skill, or .agents/config.yml changes.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SLOT = re.compile(r"[{][{]([A-Z_][A-Z0-9_]*)[}][}]")
SKILL_INDEX_REF = re.compile(r"\.agents/skills/([A-Za-z0-9._/-]+/SKILL\.md)")
ABS_PATH_REF = re.compile(r"(?<![\w/.-])(\.agents/[A-Za-z0-9_./-]*[A-Za-z0-9_/-])")
REL_PATH_REF = re.compile(r"(?<![\w/.-])(resources/[A-Za-z0-9_./-]*[A-Za-z0-9_/-])")
FRONT_MATTER_KEYS = ("name", "description", "when-to-use")
CONFIG_KEYS = (
    "convention_version",
    "adopted_from",
    "repo",
    "language",
    "package_manager",
    "commands",
    "check",
    "test",
    "lint",
    "build",
    "ci_workflow",
    "paths",
    "architecture",
    "product",
    "design",
)
SCAN_SKIP = ("/scripts/",)
TRAILING = ".,;:)]}"
MAX_SKILL_LINES = 120


class Report:
    """Collects results so the run can report every problem, not only the first."""

    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.notes: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def note(self, message: str) -> None:
        self.notes.append(message)


def strip_ref(ref: str) -> str:
    return ref.rstrip(TRAILING).rstrip("/")


def front_matter(path: Path) -> dict[str, str] | None:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    keys: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            return None
        key, value = line.split(":", 1)
        keys[key.strip()] = value.strip()
    return keys


def scan_files(root: Path) -> list[Path]:
    files = [root / "AGENTS.md"]
    skills_dir = root / ".agents"
    if skills_dir.is_dir():
        files += [
            p for p in sorted(skills_dir.rglob("*"))
            if p.is_file() and not any(skip in str(p) for skip in SCAN_SKIP)
        ]
    return [p for p in files if p.is_file()]


def check_paths(text: str, origin: Path, root: Path, report: Report, label: str) -> None:
    for ref in ABS_PATH_REF.findall(text):
        target = strip_ref(ref)
        if not target or not (root / target).exists():
            report.error(f"{label}: referenced path does not exist: {ref}")
    for ref in REL_PATH_REF.findall(text):
        target = strip_ref(ref)
        if not target or not (origin.parent / target).exists():
            report.error(f"{label}: referenced path does not exist: {ref}")


def main(argv: list[str]) -> int:
    template = "--template" in argv
    rest = [a for a in argv[1:] if a != "--template"]
    root = Path(rest[0]).resolve() if rest else Path.cwd()
    report = Report()

    agents = root / "AGENTS.md"
    if not agents.is_file():
        report.error("AGENTS.md: missing at the repository root")
    agents_text = agents.read_text(encoding="utf-8") if agents.is_file() else ""

    # 2. the skill index and the skills on disk must agree, in both directions.
    indexed = {strip_ref(m) for m in SKILL_INDEX_REF.findall(agents_text)}
    on_disk = {
        str(p.relative_to(root / ".agents/skills"))
        for p in sorted((root / ".agents/skills").rglob("SKILL.md"))
    } if (root / ".agents/skills").is_dir() else set()
    if not on_disk:
        report.error(".agents/skills: no skill found (expected at least one */SKILL.md)")
    for missing in sorted(on_disk - indexed):
        report.error(f"AGENTS.md: skill exists on disk but is missing from the index: .agents/skills/{missing}")
    for missing in sorted(indexed - on_disk):
        report.error(f"AGENTS.md: skill is indexed but does not exist: .agents/skills/{missing}")

    # 3. front matter of every skill.
    for rel in sorted(on_disk):
        path = root / ".agents/skills" / rel
        keys = front_matter(path)
        label = f".agents/skills/{rel}"
        if keys is None:
            report.error(f"{label}: no YAML front matter (expected --- name/description/when-to-use ---)")
            continue
        for key in FRONT_MATTER_KEYS:
            if not keys.get(key):
                report.error(f"{label}: front matter is missing a value for '{key}'")
        extra = sorted(set(keys) - set(FRONT_MATTER_KEYS))
        if extra:
            report.warn(f"{label}: unexpected front matter keys: {', '.join(extra)}")
        expected = path.parent.name
        if keys.get("name") and keys["name"] != expected:
            report.error(f"{label}: front matter name '{keys['name']}' does not match its directory '{expected}'")
        lines = len(path.read_text(encoding="utf-8").splitlines())
        if lines > MAX_SKILL_LINES:
            report.warn(f"{label}: {lines} lines; the convention asks for skills under about {MAX_SKILL_LINES}")

    # 4. every relative path referenced from AGENTS.md or from a skill must resolve.
    if agents_text:
        check_paths(agents_text, agents, root, report, "AGENTS.md")
    for rel in sorted(on_disk):
        path = root / ".agents/skills" / rel
        check_paths(path.read_text(encoding="utf-8"), path, root, report, f".agents/skills/{rel}")

    # 5. no unresolved slots, unless we are inside the template repository itself.
    found: dict[str, set[str]] = {}
    for path in scan_files(root):
        slots = SLOT.findall(path.read_text(encoding="utf-8"))
        if slots:
            found[str(path.relative_to(root))] = set(slots)
    if found:
        summary = "; ".join(f"{p}: {', '.join(sorted(s))}" for p, s in sorted(found.items()))
        if template:
            report.note(f"unresolved slots (allowed by --template): {summary}")
        else:
            report.error(f"unresolved slots remain: {summary}")

    # 6. the config file the convention reads.
    config = root / ".agents/config.yml"
    if not config.is_file():
        report.error(".agents/config.yml: missing (it is the single home for this repo's commands and paths)")
    else:
        text = config.read_text(encoding="utf-8")
        for key in CONFIG_KEYS:
            if not re.search(rf"(?m)^\s*{re.escape(key)}:", text):
                report.error(f".agents/config.yml: no '{key}:' key")
        if not template and SLOT.search(text):
            report.error(".agents/config.yml: unresolved slots remain")

    for message in report.notes:
        print(f"note  {message}")
    for message in report.warnings:
        print(f"warn  {message}")
    for message in report.errors:
        print(f"FAIL  {message}")

    skills = len(on_disk)
    if report.errors:
        print(f"\n{len(report.errors)} problem(s); {skills} skill(s) checked. {root}")
        return 1
    print(f"\nok    {skills} skill(s) indexed and valid; paths resolve; config complete. {root}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
