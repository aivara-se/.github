# Specification

## Direction

Every repository in the organisation needs the same starting rules, and copying them by hand lets the copies drift. This repository is the single home for what they share: the entry file a repository carries, the settings every repository should hold, and the checks that prove a copy is honest. The scope is the organisation's shared configuration and the checks over it. What belongs to one repository stays there: its build, its release, and its own rules.

## Requirements

It serves every repository and agent in the organisation. GitHub serves organisation-wide files from a repository named `.github`, so the files here reach every repository without a copy. A repository adopts `AGENTS.md` by copying it unchanged, and a differing copy fails the check. `docs/SETTINGS.md` states the baseline every repository is expected to carry. A rule that applies to one repository belongs in that repository, not here. No file restates another, and no file carries history. The entry file, the settings baseline and the checks are the whole of it.

## Architecture

The entry file is `AGENTS.md` at the root. The settings baseline is `docs/SETTINGS.md`. Three reusable workflows, `validate-agents`, `validate-docs` and `validate-config`, check a caller's entry file, specification and settings against the standard; a repository adds each as a job in its own `validate` workflow. `scripts/validate-config.ts` reads a repository's live settings through the GitHub API and reports any that differ from the baseline. It depends on GitHub and on Bun. The repository's own `validate` workflow runs `bun fmt --no-script --check .`, `bun x tsc --noEmit` and the spec check on every pull request.
