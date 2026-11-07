# Agent Instructions

This file is identical in every `aivara-se` repository. Edit `aivara-se/.github`; a differing copy fails the check.

## Read first

- `README.md` — what this is and how to run it.
- `PRODUCT.md` (root or `docs/`) — what this is, who it serves, and what would make it done.
- `SYSTEMS.md`, where present — how it is built and checked, the gate included.
- `DESIGN.md` — the interface values, where one exists.
- `docs/adrs/` — a decision per file, written before the code it decides.

Link to a document; never restate it. A rule that differs per repository is `SYSTEMS.md`'s.

## House rules

- Never commit a secret. A configuration file names one and holds no value.
- Never report "tests pass" or "verified" without the command and the tree.
- Never add a second package manager, lockfile, formatter or test runner; use the one it carries.
- A script that runs commands is TypeScript on `bun`; shell only when it stays a few lines.
- Open the skill whose `when-to-use` covers the work, in `aivara-se/.agents/skills`; no copy exists.
- Never edit a merged ADR. Supersede it, naming the clauses it overrides.

## Version control

- Branch: lowercase and hyphens, one per task — `docs/`, `feat/`, `fix/` or `chore/` and a short name.
- Commit: Conventional Commits, lowercase, single line, no scope.
- Never commit to `main`; never force-push a branch another person has seen; keep history linear.
- Commit under your own name.
- Land as a branch and a pull request. The body says what changed, what was verified, what was left out.
- The operator reviews a documents-only change alone; an implementation adds a peer.
