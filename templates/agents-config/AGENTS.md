# Agent Instructions

`{{ORG}}/{{REPO_NAME}}` is worked on by agents as much as by people, and this file is the instruction set every one of them reads first. It is a copy of the `{{ORG}}` agent convention, version `{{CONVENTION_VERSION}}`, adopted from `{{ADOPTED_FROM}}`. Adopt it, do not fork it: repository-specific facts live in `.agents/config.yml` and in the sections below, and nothing else here is meant to be edited per repository.

{{REPO_PURPOSE}}

## Current Project Focus

{{CURRENT_FOCUS}}

This section is steering, not policy. It is the one place where what matters right now outranks the standing rules below, it changes often, and it is replaced rather than appended to. Keep it short enough to read in full, and current enough to be worth reading.

## Agent Roles

Work in this repository is done by agents taking one of three roles. A task names the role that owns it; every role reads this same file and is held to it.

- **Orchestrator** — turns a goal into tasks with acceptance criteria, settles the questions two tasks would otherwise answer differently, and routes work to the other roles. Does not implement.
- **Builder** — does the work. Reads the task, its parents' handoffs and its comments; writes the change; runs the commands in `.agents/config.yml`; hands back what changed, what was verified, and what was left out.
- **Reviewer** — verifies a handoff or a pull request the reviewer did not write: reads the diff twice, runs it, tests the claim, and returns a verdict. The author of a branch never reviews it.

The **operator** is the human who owns this repository. The operator decides what is worth doing, grants access, and answers what an agent cannot. An agent that needs a decision says so and stops; it does not make the decision for the operator.

## How Work Moves

- Work arrives as a task on the shared board (Hermes Kanban), with a body: what is wanted, and the acceptance criteria the work will be judged on. The task generally carries the handoffs of the tasks it depends on and the comments on it — read those before you start, not after.
- The claim in a task and its acceptance criteria are not always the same thing. Where they differ, the criteria and the diff decide; the difference is a finding.
- Work happens in that task's workspace and on that task's branch. One task, one branch; never mix two tasks in one branch, and never continue another task's branch.
- A handoff states what changed, what was verified — the exact command, the result, and the tree it ran against — and what was deliberately left out. A handoff without that output is a claim, not a handoff.
- Implementation is finished when someone else has reviewed it and approved. A branch with no reviewer is unfinished work, not done work.
- A reviewer's verdict is exactly one of `approve`, `request changes` or `block`, and the `review` skill defines what each requires. The reviewer's report follows the fixed five-section schema in `.agents/prompts/code-review.md`, so that two reviewers of the same diff produce comparable reports.
- **What you may do unasked:** read the repository; create a branch; commit to it; push it; open a pull request against `{{DEFAULT_BRANCH}}`; run the commands declared in `.agents/config.yml`. **Nothing else.** Merging, tagging, releasing, changing repository settings, and writing outside the task's workspace are the operator's calls.

## Clarifying Requirements

- Ask before assuming, when a wrong assumption would cost a rewrite: an ambiguous requirement, a missing input, a decision the task does not make. Ask once, state the options you see, and recommend one.
- Ask first, then act. Do not spend the task on a guess the operator will reject.
- If the task is larger than it says, say so in a comment, with what you found, and let the owner decide whether to widen it or split it. Never quietly widen it yourself.

## Tooling and Verification

- `.agents/config.yml` is the only home for this repository's language, its package manager, its commands and the paths of its authoritative documents. Reference them by key, from here and from every skill; never restate a command in prose.
- `commands.check` is the wrapper: one command that runs everything this repository gates on. **ALWAYS** run it on the final tree, after the last edit, and quote the real output. CI runs the same wrapper — if the two sequences differ, the CI file is the bug.
- `commands.test`, `commands.lint` and `commands.build` are the narrower steps. `null` means this repository has no such gate: say so plainly, **never** invent a command to fill it, and never install a tool this repository does not use.
- **Never** report "tests pass", "it builds" or "verified" without the command and the tree it ran against.
- **Never** add a second package manager, a second lockfile, a second formatter or a second test runner — the toolchain is the one declared in `.agents/config.yml`.

## Version Control

- **Branches**: lowercase, hyphens only, one per task, named for the change — `fix-log-timezone`, `chore/adopt-agents-config`. No uppercase, no underscores, no personal prefixes.
- **Commits**: Conventional Commits, lowercase, single line, no scopes — `type: short description`.
- **Never** commit to `{{DEFAULT_BRANCH}}` directly. **Never** force-push a branch another agent or person has seen.
- Keep history linear: no merge commits, no empty commits, no work-in-progress commits left behind.
- Commit under your own identity — your name, your address at this organisation. Never a generic bot, never another agent's identity.
- Remote work is always a branch plus a pull request. The pull request body says what changed, what was verified and how, and what was left out; request review from {{REVIEW_REQUEST_TARGETS}}. Leave the working tree clean: no scratch files, no editor backups, no `.env` you created.

## Repository Structure

{{REPO_STRUCTURE}}

- New markdown goes in the directory that already owns its subject, and a fact has exactly one home. Never add a second copy of something a document already says; link to it.
- The documents authoritative for architecture, product and design are declared in `.agents/config.yml` under `paths`. A change that makes one of them wrong is not finished until that document is right, in the same change.
- If a path in the map above stops being true, fix the map in the same pull request. A map that lies is worse than no map.

## Agent Skills

`.agents/skills/` holds one skill per kind of work — the procedure to follow, not a second copy of these instructions. Each skill declares in its front matter what it covers and its `when-to-use`: the situation in which you must open it. Read the skill that covers the work before you start it.

- .agents/skills/repo-workflow/SKILL.md
- .agents/skills/coding/SKILL.md
- .agents/skills/testing/SKILL.md
- .agents/skills/writing/SKILL.md
- .agents/skills/review/SKILL.md

How this index stays true:

- Every skill on disk is listed above, and every skill listed above exists. A new skill is added here in the same pull request; run `python3 .agents/scripts/validate_agents_config.py` and it will fail if the index and the directory disagree.
- Front matter is exactly three keys: `name`, equal to the directory; `description`, one sentence; `when-to-use`, the trigger in the reader's words. A skill stays under about 120 lines, covers one concern, and names every file it ships.
- Skills are flat until this repository has more than eight of them or two clearly unrelated groups, then they are grouped under `.agents/skills/<group>/<skill>/` and this index is updated with them.
- A skill that is true only of this repository stays here. A skill that would be true of every repository belongs in the `{{ORG}}` convention instead, in a pull request of its own.
