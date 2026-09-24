---
name: repo-workflow
description: How work moves through this repository — running it, branching, verifying, and opening the pull request.
when-to-use: Before your first change in a repository you have not worked in before, and again whenever you are about to commit, push, or open a pull request.
---

# Repository Workflow

## Before the first edit

- Read `AGENTS.md`, then `.agents/config.yml`. That file is the only place this repository's commands and document paths are declared.
- Read the skill that covers the work you are about to do — `coding`, `testing` or `writing`. Each one states its trigger in `when-to-use`.
- Read the task, its parents' handoffs and its comments. The task body is the requirement; the acceptance criteria in it are what you will be judged on.
- Work in the workspace and on the branch that belong to this task. One task, one branch. Never continue another task's branch, and never mix two tasks in one branch.

## Run it before you trust it

- `commands.check` in `.agents/config.yml` is this repository's single gate. Run it on the final tree, after the last edit, and quote the real output in your handoff.
- **Never** report "tests pass", "it builds" or "verified" without the command and the tree it ran against.
- A `null` command means this repository has no automated gate for that step. Say so plainly; do not substitute a command you guessed, and do not install a tool the repository does not use.
- When the check fails, read the failure before changing anything else. Fix the cause, re-run, and report the re-run — not the intent.
- CI runs the same wrapper. If CI runs a different sequence, the CI file is the bug: fix it in this change or report it.

## Branch, commit, push, pull request

- **Branch names**: lowercase, hyphens only, one per task — `fix-log-timezone`, `chore/adopt-agents-config`. No uppercase, no underscores, no personal prefixes.
- **Commits**: Conventional Commits, lowercase, single line, no scopes — `type: short description`. Keep history linear: no merge commits, no empty commits, no work-in-progress commits.
- **Never** commit to `main` directly, and **never** force-push a branch another agent or human has seen. Remote work is always a branch plus a pull request.
- Commit under the identity configured on your machine (your own name and your `aivara.se` address) — not a generic bot, and never another agent's identity.
- The pull request body states what changed, what was verified (exact command and result), and what was deliberately left out. Request review from the operator (`thani-sh`) and one peer agent.
- A pull request nobody has reviewed is unfinished work, not done work. If you are asked to review one, switch to the `review` skill.
- Leave the workspace clean: no stray scratch files, no editor backups, no `.env` you created. The diff is what gets reviewed.

## When you are blocked

- Block the task and say what you need, in one or two sentences, before you spend effort on a guess. Blocking is a status, not a failure.
- Block for a missing decision, a missing credential, a missing permission, or a dependency that has not landed — not for work you would rather not do.
- If you discover the task is larger than it says, say so in a comment with what you found; the owner decides whether to widen the task or split it, not you.
