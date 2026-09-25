# The `aivara-se` agent configuration convention

Work in this organisation is done by agents as much as by people, and every repository should hand them the same instructions. This directory is that shared text: it is kept once, here in the org's `.github` repository, and copied into a repository when that repository adopts the convention.

It is a generalisation of `thani-sh/provar`'s agent configuration (analysed in `docs/provar-agents-analysis.md` in this repository, PR #1), taking its current shape from `aivara-se/bot-momo`'s `AGENTS.md`. The **current project focus** section, the single wrapper command humans, agents and CI all run, and the fixed review-report schema were kept. Provar's Go/TypeScript specifics, its machinery, and the four defects the analysis found were dropped. "What came from provar, and what did not" below is the honest list of both, including the parts that were dropped after the fact.

## What is in here, and what gets copied

```
templates/agents-config/
  README.md                     this file — how a repo adopts the convention     (stays here)
  AGENTS.md                     the entry point an agent reads first             ─┐
  .agents/                                                                        │ copied into
    skills/                                                                       │ the adopting
      coding/SKILL.md                                                             │ repo's root
      testing/SKILL.md                                                            │
      writing/SKILL.md                                                            │
        resources/readme-template.md                                              │
      review/SKILL.md                                                           ─┘
```

`README.md` stays in this directory: it is about the convention, not about the adopting repository. Everything else is copied.

That is the whole convention: one entry file, and the skills it indexes. There is no configuration file, no checker script, no prompt file and no scaffold file — nothing that can drift out of step with the instructions, because there is nothing but instructions. Commands, paths and the repository's own rules are written once, in `AGENTS.md`; the skills are written to stand on their own — a skill names no file of the convention and points at no other skill — and it is the entry file that points at them. Where a repository does need a script, it is a Bun script (see **Tooling** in `AGENTS.md`); this template ships none of its own.

The copied files are written to the formatting defaults of the org's usual tooling (markdown as `prettier` leaves it), so a repository whose gate checks the whole tree does not inherit a red check from files it must not reformat. Formatting changes belong here, in the template, not in a per-repository copy.

## Adopt it — a dummy repository walkthrough

The steps below are literal. In them, the adopting repository is `/tmp/dummy-repo`; substitute your own path. Nothing here needs network access beyond the clones you already have, and nothing here needs a runtime.

### Step 0 — what you need

- A clone of the repository you are adopting into, and push access to a branch of it.
- A clone of `aivara-se/.github` (this repository), for the template files.
- An editor. There is no substitution script to install, no runtime to declare and no tool to run: the slots below are filled in by hand because a filled-in `AGENTS.md` is something a human has to mean.
- The answers to the slot table in step 2. For a repository with a build toolchain you can read most of them from `package.json`, the CI workflow, or the existing `AGENTS.md`.

### Step 1 — copy the files

```sh
TEMPLATE=/path/to/aivara-se/.github/templates/agents-config
REPO=/tmp/dummy-repo
cp "$TEMPLATE/AGENTS.md" "$REPO/AGENTS.md"
mkdir -p "$REPO/.agents"
cp -r "$TEMPLATE/.agents/skills" "$REPO/.agents/skills"
```

If the repository already has an `AGENTS.md` (most of them do), **merge, do not overwrite**: keep every repository-specific section — its house rules, its procedures, its deployment note — and put the shared sections around them, with **Repository Structure** and **Agent Skills** last. The repository-specific text is what makes that file useful; the shared text is what makes it consistent. When the two conflict, follow the shared rules and say so in the pull request. The same applies to a `CLAUDE.md`, if one ever appears — it gets a pointer to `AGENTS.md`, not a second copy of the rules.

The shared sections run from the title to **Agent Skills**. A repository's own sections — its procedures, a content convention, its deploy note — sit above **Version Control**, alongside the **House rules** slot that carries its hard rules. Everything from **Version Control** down is the convention and is not edited per repository.

### Step 2 — fill in the slots

Every slot uses the same syntax: `{{UPPER_SNAKE_CASE}}`. There is no other templating syntax anywhere in the copied tree, so `grep -rn '{{' <repo> --exclude-dir=.git` after step 3 must print nothing.

| Slot                         | Required | Meaning                                                                              | Example                                                                |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `{{ORG}}`                    | yes      | the GitHub organisation that owns the repo and the convention                        | `aivara-se`                                                            |
| `{{CONVENTION_VERSION}}`     | yes      | the integer revision of this template you are adopting                               | `2`                                                                    |
| `{{ADOPTED_FROM}}`           | yes      | commit in `aivara-se/.github` this copy came from (`git -C <clone> rev-parse HEAD`)  | `9c5f6ed`                                                              |
| `{{REPO_PURPOSE}}`           | yes      | one sentence: what this repository is and who it is for                              | `The personal website of the MaMa agent, published at https://mama.aivara.se.` |
| `{{REPO_OVERVIEW}}`          | yes      | one paragraph: what the repository is made of, and where its documents are           | `Static HTML with inline CSS — no build step, no dependencies...`      |
| `{{CURRENT_FOCUS}}`          | yes      | the work wanted right now, and what not to touch                                     | `Polish the log page. Do not restructure the CSS.`                     |
| `{{REPO_HOUSE_RULES}}`       | yes      | the rules true of this repository and nowhere else, one bullet each                  | `- **One accent hue: \`#f7a8d8\`.** Never add a second hue.`             |
| `{{REPO_CHECK_COMMAND}}`     | yes      | **the single wrapper command** humans, agents and CI all run                         | `bun run check`                                                        |
| `{{REPO_CHECK_NOTES}}`       | yes      | one paragraph: what that command cannot see, and how a reviewer checks it            | `Then the two things it cannot see: the phone viewport, and the rendered page.` |
| `{{DEFAULT_BRANCH}}`         | yes      | the branch work lands on                                                             | `main`                                                                 |
| `{{REVIEW_REQUEST_TARGETS}}` | yes      | who a pull request asks for review                                                   | ``the operator (`thani-sh`) and one peer agent``                       |
| `{{REPO_STRUCTURE}}`         | yes      | the repository map: one bullet per path that matters                                 | `- \`index.html\`: the single-screen front page`                         |

House rules are imperative and checkable, and carry `ALWAYS` or `Never` where no judgement applies: a rule nobody can act on, or argue with, is not a rule. A house rule names the file, the class, the path or the command it is about.

No slot is left behind and no slot is invented: the table above, the slots in `AGENTS.md` and the values a repository writes into its copy are the same list. An unfilled slot means the adoption is unfinished — that is what step 3 checks.

### Step 3 — check the result

```sh
cd /tmp/dummy-repo
grep -rn '{{' . --exclude-dir=.git          # must print nothing
find .agents/skills -name SKILL.md | sort   # must match the index in AGENTS.md, exactly
head -4 .agents/skills/*/SKILL.md           # name, description, when-to-use in each
```

The three checks are mechanical: no slot survives, the index lists the skills that exist and no others, and every skill's front matter is exactly three keys with `name` equal to its directory. Read them against the output rather than assuming; the index is the one part of the convention that a change can silently break.

Then run the repository's own check command and quote its real output. CI must run the same command — if the two sequences differ, the CI file is the bug, and fixing it belongs in this change.

### Step 4 — land it

```sh
cd /tmp/dummy-repo
git checkout -b chore/adopt-agents-config
git add AGENTS.md .agents
git commit -m "chore: adopt aivara-se agent configuration"
git push -u origin chore/adopt-agents-config
gh pr create --base main --title "Adopt shared agent configuration" \
  --body "Applies the aivara-se agent convention from aivara-se/.github \`templates/agents-config/\` (version 2): AGENTS.md and .agents/skills/. Repo-specific instructions preserved; the shared sections and the skill index are the convention's."
```

Then request review from the targets named in `{{REVIEW_REQUEST_TARGETS}}`. Never push to the default branch, and never force-push.

## Adding or changing a skill

1. Create `.agents/skills/<skill-name>/SKILL.md` from the block below.
2. Add it to the skill index in `AGENTS.md` **in the same pull request**. A skill on disk and not in the index is invisible; a skill in the index and not on disk is a lie.
3. Check the index, the front matter and any file the skill names, as in step 3.

Rules for a skill under this convention:

- **One concern per skill.** A reader should be able to act on it, not choose between it and another skill. "Coding" is a concern; "Go coding in the API package" is a section of one.
- **Front matter is exactly three keys.** `name` must equal the directory name; `description` is one sentence on what the skill covers; `when-to-use` is the trigger in the reader's own words. Nothing else — no versions, no tool lists, no paths, because nothing consumes them.
- **Keep it under about 120 lines.** Past that it is either two skills or the detail belongs in `resources/`.
- **Name every file the skill ships.** A `resources/` file or a template that the body does not reference is invisible; provar shipped two README templates in exactly that state.
- **A skill stands on its own.** It is read by someone who may never open another file, so it names no file of the convention — not `AGENTS.md`, not another skill — and it carries the rule rather than the pointer. The direction is the other way round: the entry file points at the skills, and the skill answers. Where a rule needs a command, the skill names the concept ("the repository's check command") and leaves the literal command in the one place it is written down.
- **No language or tool specifics — bar the organisation's own standing choices.** Formatting and linting are the language's own tools, and the package manager and the test runner are the repository's, so a shared skill that names `go vet` or `cargo test` is broken in the next repository. The one exception is a rule the organisation itself has decided, like the Bun-script rule in the `coding` skill: that is policy, and it belongs in the skill that carries it.
- **Authoring a skill in a repository is local.** Moving it into `templates/agents-config/.agents/skills/` is an org-wide change: do it when a second repository wants it, in a pull request of its own.

### The block to copy

```markdown
---
name: <the skill's directory name>
description: <what this skill covers, one sentence.>
when-to-use: <the situation in which a reader must open this file.>
---

# <Title>

<One or two sentences: what this skill is for, and the line between it and the neighbouring skills.>

## <Section>

- **<Rule>**: <why, and the command or path that makes it checkable.>

## <Section>

- ...

## Pre-Completion Verification

<What to run, and what must be true, before a reader of this skill claims the work is done.>
```

Write the body in the same register as the rest of the convention: imperative, second person, no hedging, no filler, and every rule marked `ALWAYS` or `Never` when it admits no judgement. Every `<...>` in the block is a fill-in; nothing replaces it for you.

Skills are flat until a repository has more than eight of them or two clearly unrelated groups; then group them under `.agents/skills/<group>/<skill>/` and update the index. Four flat skills do not need a taxonomy.

## Upgrading an adopted repository

The convention is versioned by an integer, recorded in `AGENTS.md` as `{{CONVENTION_VERSION}}`, with `{{ADOPTED_FROM}}` holding the commit in `aivara-se/.github` the copy came from. To move a repository to a newer revision: copy the new `AGENTS.md` and `.agents/skills/` over a scratch checkout, carry the repository's own values and sections across (steps 1 and 2), bump the version and the commit, and run step 3 again. Open the pull request as usual. Do not re-copy blindly — the diff between the two versions is the review artifact, and the sections it deletes are the part a reviewer must see.

## What came from provar, and what did not

Kept, generalised:

| Kept                                                                                                                      | Why                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A root `AGENTS.md` as the single entry point, tool-neutral, no vendor manifest                                             | It is what an agent reads first, and it costs nothing to keep true                                                                                                                                                                                     |
| The section order — status → focus → house rules → tooling → verify → version control → structure → skills                  | The ordering rationale survives the language change: temporary steering before standing rules, "ask first" before commands, the skill index last. A repository's own sections sit after the house rules and above Version Control, where they cannot contradict the shared rules below them |
| `## Current Project Focus`                                                                                                 | Turns steering that would otherwise be repeated in chat into a reviewable statement                                                                                                                                                                     |
| `ALWAYS`/`Never` instead of "consider"/"prefer"                                                                             | Rules that admit no judgement are marked as such                                                                                                                                                                                                       |
| Conventional Commits, lowercase hyphenated branches, no merge commits                                                      | Org-wide policy, not repo-specific                                                                                                                                                                                                                     |
| A repo map with an explicit "where does new markdown go" rule                                                              | It is the cheapest guard against documentation sprawl — provided the map is true                                                                                                                                                                        |
| `.agents/skills/<name>/SKILL.md` with minimal YAML front matter                                                             | No registry, no tooling, discoverable by reading one file                                                                                                                                                                                               |
| Splitting skills by concern (coding / testing / writing), not by language                                                  | The concerns are stable across a polyglot org; the languages are not                                                                                                                                                                                    |
| `resources/` next to a `SKILL.md` for supporting files                                                                     | Simple, and it needs no index                                                                                                                                                                                                                           |
| The fixed review-report schema — the verdict line, the summary, findings with evidence, the target design, the phased plan, the blueprint | The most transferable idea in provar: it makes two reviewers' reports comparable. It now lives inside the `review` skill, where the reader already is                                                                                                    |
| A "Pre-Completion Verification" section inside a skill                                                                     | "What to run before you say done" belongs where the work happens                                                                                                                                                                                        |
| One wrapper command that humans, agents and CI all run                                                                    | Removes command drift between the docs and CI                                                                                                                                                                                                          |

Added, because provar has none of it: the `when-to-use` front-matter key; a skill index that a pull request keeps true; convention versioning; a review verdict vocabulary; the "Bun for scripts" rule; and the house-rules section, so that a repository's own hard rules have a home in the shared file instead of a private corner of it.

Dropped: all product prose and the domain-model freeze; the Go-specific rules (standard-library-first, `panic` policy, `any` avoidance, naming and comment conventions); the "no empty lines inside a function body" house style; every literal command; the monorepo map and the `docs/SYSTEM.md` filename it got wrong; the provar-flavoured README scaffolds.

Later revisions dropped the machinery, because instruction files should not need a runtime to be true:

- **`.agents/config.yml`** — a second home for commands and paths, next to the one in `AGENTS.md`. Commands are written down once, in `AGENTS.md`; the skills name no file of the convention, and the entry file is what points at them.
- **`.agents/scripts/validate_agents_config.py`** — a Python checker for an index that three lines of shell can check, and a runtime every adopting repository would have had to have.
- **`.agents/prompts/code-review.md`** — a prompt file separate from the skill that used it. The schema is in the `review` skill now, but the defect provar shipped (a schema reachable from nowhere) is still not inherited, so the file is gone rather than duplicated.
- **`TEMPLATE.md`** and **`.agents/skills/repo-workflow/`** — a scaffold and a workflow skill whose content the skill list in `AGENTS.md` already covered.

Three defects in provar are deliberately not inherited, each cited in the analysis:

1. **Two package managers, one instruction** — `AGENTS.md` mandates Bun while `package.json` declares `npm@11.17.0` and CI runs `npm`. Here the toolchain rule is one line, and the toolchain is the one the repository already uses.
2. **A skill's resources unreachable from the skill** — provar's writing skill shipped two README templates that nothing referenced. Here every skill names the files it ships, and a reviewer fails a skill that does not.
3. **The review prompt is never referenced** — provar's `.agents/prompts/code-review.md` was invisible from `AGENTS.md`. Here the schema is part of the `review` skill, which the index lists.
