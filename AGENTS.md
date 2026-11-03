# Agent Instructions

The organisation's shared repository: the files GitHub serves to every `aivara-se` repository, and the standards those repositories follow. `README.md` says what lands here. This file says how a change here is made.

## Where a fact lives

- `README.md` — what this repository is for, and what belongs in it.
- `docs/SETTINGS.md` — the baseline every repository carries, and what the default branch accepts.
- `docs/RELEASES.md` — the release standard.
- `.github/workflows/` — the checks that run, and the only copy of them.

One fact, one home. A rule that applies to one repository belongs in that repository, not here.

## House rules

- Every file here is the only copy of what it says. A change to one is a change to every repository, so name what it affects in the pull request.
- A workflow default is a claim about every repository. Change it when the repositories can follow it, not before.
- A comment beside a step says why the step exists. Delete the comment when the step goes.

## Tooling

- **Bun runs the scripts.** A script that runs commands is TypeScript, run with `bun run scripts/<name>.ts` — never Python, and a shell script only when it stays a few lines. A command typed at the prompt is not a script.
- **Never** add a second package manager, lockfile, formatter or test runner. The toolchain is the one the repository already declares.
- **Never** report "tests pass", "it builds" or "verified" without the command and the tree it ran against.

## Verify before pushing

```bash
bun install --frozen-lockfile
bun fmt --no-script --check .
bun x tsc --noEmit
bun test
```

Run the whole sequence and read every result — the last exit code says nothing about the first.

The same commands run in `.github/workflows/validate.yml`, whose job is named `validate`: that is the check the default branch requires before a merge. `verify-settings` is not part of this sequence. It reads the live organisation, needs `ORG_READ_TOKEN`, and runs by hand.

## Version Control

- **Branches**: lowercase, hyphens, one per task: `docs/`, `feat/`, `fix/` or `chore/` and a short name — `docs/adopt-agents-config`, `fix-log-timezone`. No uppercase, no underscores, no personal prefixes.
- **Commits**: Conventional Commits, lowercase, single line, no scopes — `type: short description`.
- **Never** commit to `main` directly, and **never** force-push a branch someone else has seen.
- Keep history linear: no merge commits, no empty commits, no work-in-progress commits.
- Commit under your own identity, never another agent's.
- Remote work is a branch plus a pull request: the body says what changed, what was verified and how, and what was left out. Leave the tree clean.
- Request review from the operator (`thani-sh`) alone on a documents-only change, and from one peer agent as well on an implementation one.

## Skills

The organisation's skills live in `aivara-se/.agents/skills` and every agent reads them from there; a repository carries no copy. Each declares a `when-to-use`: open the one that covers the work before starting it.
