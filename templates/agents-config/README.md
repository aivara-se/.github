# The `aivara-se` agent configuration convention

Work in this organisation is done by agents — an orchestrator that routes, a builder that implements, a reviewer that verifies — and every repository should hand them the same instructions. This directory is that shared text: it is kept once, here in the org's `.github` repository, and copied into a repository when that repository adopts the convention.

It is a generalisation of the agent configuration in `thani-sh/provar` (analysed in `docs/provar-agents-analysis.md` in this repository, PR #1). Provar's structure, its single wrapper command that humans, agents and CI all run, and its fixed review-output schema were kept. Provar's Go/TypeScript specifics and the four defects the analysis found were dropped. "What came from provar, and what did not" below is the honest list of both.

## What is in here, and what gets copied

```
templates/agents-config/
  README.md                    this file — how a repo adopts the convention   (stays here)
  TEMPLATE.md                  scaffold for a new skill                       (stays here)
  AGENTS.md                    the entry point             ─┐
  .agents/                                                   │ copied into the
    config.yml                 this repo's commands and paths ├ adopting repo's
    prompts/code-review.md     the fixed review schema         │ root
    scripts/validate_agents_config.py  the convention checker  │
    skills/                                                    │
      repo-workflow/SKILL.md                                   │
      coding/SKILL.md                                          │
      testing/SKILL.md                                         │
      writing/SKILL.md                                         │
        resources/readme-template.md                           │
      review/SKILL.md                                       ─┘
```

`README.md` and `TEMPLATE.md` stay in this directory: they are about the convention, not about the adopting repository. The rest is copied.

The copied files are formatted the way `prettier` formats them with its default configuration, so a repository whose gate checks the whole tree does not inherit a red check from files it must not reformat. Formatting changes belong here, in the template, not in a per-repository copy.

## Adopt it — a dummy repository walkthrough

The steps below are literal. In them, the adopting repository is `/tmp/dummy-repo`; substitute your own path. Nothing here needs network access beyond the clone you already have.

### Step 0 — what you need

- A clone of the repository you are adopting into, and push access to a branch of it.
- A clone of `aivara-se/.github` (this repository), for the template files.
- `python3` on `PATH` (the substitution in step 3 and the checker in step 4 are stdlib-only Python 3).
- The answers to the placeholder table in step 2. For a repository with a build toolchain you can read most of them from `package.json`, the CI workflow, or the existing `AGENTS.md`.

### Step 1 — copy the files

```sh
TEMPLATE=/path/to/aivara-se/.github/templates/agents-config
REPO=/tmp/dummy-repo
cp "$TEMPLATE/AGENTS.md" "$REPO/AGENTS.md"
cp -r "$TEMPLATE/.agents" "$REPO/.agents"
chmod +x "$REPO/.agents/scripts/validate_agents_config.py"
```

If the repository already has an `AGENTS.md` (five of the seven `aivara-se` repositories do), **merge, do not overwrite**: keep every repository-specific section, and add the shared sections around them. The repository-specific text is what makes that file useful; the shared text is what makes it consistent. When the two conflict, follow the shared rules and say so in the pull request. The same applies to a `CLAUDE.md`, if one ever appears — it gets a pointer to `AGENTS.md`, not a second copy of the rules.

### Step 2 — fill in the placeholders

Every slot uses the same syntax: `{{UPPER_SNAKE_CASE}}`. There is no other templating syntax anywhere in the copied tree, so `grep -rn '{{' <repo>` after step 3 must print nothing.

| Placeholder                  | Required | Meaning                                                                                      | Example                                                                |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `{{ORG}}`                    | yes      | the GitHub organisation that owns the repo and the convention                                | `aivara-se`                                                            |
| `{{REPO_NAME}}`              | yes      | the repository name, without the owner                                                       | `bot-mama`                                                             |
| `{{CONVENTION_VERSION}}`     | yes      | the integer revision of this template you are adopting                                       | `1`                                                                    |
| `{{ADOPTED_FROM}}`           | yes      | commit in `aivara-se/.github` this copy came from (`git -C <clone> rev-parse HEAD`)          | `9c5f6ed`                                                              |
| `{{REPO_PURPOSE}}`           | yes      | one sentence: what this repository is and who it is for                                      | `Static site for the MaMa agent, published at https://mama.aivara.se.` |
| `{{CURRENT_FOCUS}}`          | yes      | the work wanted right now, and what not to touch                                             | `Polish the log page. Do not restructure the CSS.`                     |
| `{{DEFAULT_BRANCH}}`         | yes      | the branch work lands on                                                                     | `main`                                                                 |
| `{{REVIEW_REQUEST_TARGETS}}` | yes      | who a pull request asks for review                                                           | ``the operator (`thani-sh`) and one peer agent``                       |
| `{{REPO_STRUCTURE}}`         | yes      | the repo map: one line per path that matters, as a multi-line string                         | see step 3                                                             |
| `{{REPO_LANGUAGE}}`          | yes      | the primary language, or `none`                                                              | `HTML`                                                                 |
| `{{REPO_PACKAGE_MANAGER}}`   | yes      | `bun`, `npm`, `cargo`, or `none`                                                             | `none`                                                                 |
| `{{REPO_CHECK_COMMAND}}`     | yes      | **the single wrapper command** humans, agents and CI all run; `null` if the repo has no gate | `./scripts/verify-site.sh`                                             |
| `{{REPO_TEST_COMMAND}}`      | no       | the test command, or `null`                                                                  | `./scripts/verify-site.sh`                                             |
| `{{REPO_LINT_COMMAND}}`      | no       | the lint/format command, or `null`                                                           | `bun run format:check`                                                 |
| `{{REPO_BUILD_COMMAND}}`     | no       | the build command, or `null`                                                                 | `bun run build`                                                        |
| `{{REPO_CI_WORKFLOW}}`       | no       | path to the CI workflow, or `null`                                                           | `.github/workflows/checks.yml`                                         |
| `{{ARCH_DOC_PATH}}`          | yes      | the document that is authoritative for architecture, or `none`                               | `docs/SYSTEM.md`                                                       |
| `{{PRODUCT_DOC_PATH}}`       | yes      | the document that is authoritative for the product, or `none`                                | `docs/PRODUCT.md`                                                      |
| `{{DESIGN_DOC_PATH}}`        | yes      | the document that is authoritative for UI/UX, or `none`                                      | `docs/DESIGN.md`                                                       |

Command values are single-line strings written into `config.yml` as quoted YAML scalars, and a command this repo does not have is the bare `null` — never the string `"null"`, never an empty string, never a guess. Step 3 writes both forms; a copy filled in by hand must use the bare one.

### Step 3 — substitute them

Edit the `VALUES` dictionary below and run the script from the adopting repository's root. It writes each value into `AGENTS.md`, `.agents/config.yml` and the skills, then fails loudly if a placeholder in the tree has no value or if any placeholder survives. A command slot whose value is the literal `null` is written into `config.yml` as the bare `null`, so a gate this repository does not have reads as `None` to a YAML parser and not as the string `"null"`.

```sh
cd /tmp/dummy-repo
python3 - <<'PY'
import re
from pathlib import Path

VALUES = {
    "ORG": "aivara-se",
    "REPO_NAME": "dummy-repo",
    "CONVENTION_VERSION": "1",
    "ADOPTED_FROM": "<commit sha of aivara-se/.github>",
    "REPO_PURPOSE": "One sentence: what this repository is, and who it is for.",
    "CURRENT_FOCUS": "What is wanted now, and what must not be touched.",
    "DEFAULT_BRANCH": "main",
    "REVIEW_REQUEST_TARGETS": "the operator (`thani-sh`) and one peer agent",
    "REPO_STRUCTURE": "- `src/`: the code\n- `docs/`: the documents this repo is authoritative for\n- `scripts/`: the checks",
    "REPO_LANGUAGE": "HTML",
    "REPO_PACKAGE_MANAGER": "none",
    "REPO_CHECK_COMMAND": "./scripts/verify-site.sh",
    "REPO_TEST_COMMAND": "null",
    "REPO_LINT_COMMAND": "null",
    "REPO_BUILD_COMMAND": "null",
    "REPO_CI_WORKFLOW": "null",
    "ARCH_DOC_PATH": "docs/SYSTEM.md",
    "PRODUCT_DOC_PATH": "docs/PRODUCT.md",
    "DESIGN_DOC_PATH": "docs/DESIGN.md",
}

SKIP = ".agents/scripts"  # the checker contains no placeholders and is not rewritten
PATTERN = re.compile(r"\{\{([A-Z_][A-Z0-9_]*)\}\}")
targets = [Path("AGENTS.md")] + [p for p in Path(".agents").rglob("*")
                                 if p.is_file() and SKIP not in str(p)]
unmapped = set()
for path in targets:
    text = path.read_text()
    def repl(m, path=path):
        key = m.group(1)
        if key not in VALUES:
            unmapped.add(key)
            return m.group(0)
        return VALUES[key]
    path.write_text(PATTERN.sub(repl, text))
# An absent gate is the bare YAML null, never the string "null" (step 2). The template quotes
# its command slots so that an unfilled checkout is valid YAML; this is where that quoting
# comes off, so the filled-in file reads as null to a YAML parser rather than as a command.
config = Path(".agents/config.yml")
config.write_text(re.sub(r'(?m)^(\s*[\w]+:\s*)"null"(?=\s|$)', r"\1null", config.read_text()))
if unmapped:
    raise SystemExit("no value supplied for: " + ", ".join(sorted(unmapped)))
left = [str(p) for p in targets if "{{" in p.read_text()]
if left:
    raise SystemExit("placeholders left behind in: " + ", ".join(left))
print(f"substituted {len(targets)} files")
PY
```

### Step 4 — check the result

```sh
python3 .agents/scripts/validate_agents_config.py
```

It must exit 0. If it does not, it names the file and the problem, and the fix is whatever it names: a skill that exists but is missing from the index in `AGENTS.md`, a skill whose front matter lacks `when-to-use`, a path referenced but absent, a placeholder left behind, or a command slot written as the string `"null"` instead of the bare `null`. The checker is part of the copied tree on purpose — run it whenever `AGENTS.md`, a skill or `.agents/config.yml` changes.

### Step 5 — land it

```sh
cd /tmp/dummy-repo
git checkout -b chore/adopt-agents-config
git add AGENTS.md .agents
git commit -m "chore: adopt aivara-se agent configuration"
git push -u origin chore/adopt-agents-config
gh pr create --base main --title "Adopt shared agent configuration" \
  --body "Applies the aivara-se agent convention from aivara-se/.github \`templates/agents-config/\` (version 1). Adds AGENTS.md and .agents/; repo-specific instructions preserved."
```

Then request review from the targets named in `{{REVIEW_REQUEST_TARGETS}}`. Never push to the default branch, and never force-push.

## The per-repo override mechanism

Commands, paths and the repo's identity are declared **once**, in `.agents/config.yml`, and nowhere else:

```yaml
convention_version: "1"
adopted_from: "<the commit in aivara-se/.github this copy came from>"
repo: "aivara-se/dummy-repo"
language: "HTML"
package_manager: "none"
commands:
  check: "./scripts/verify-site.sh"
  test: null
  lint: null
  build: null
ci_workflow: null
paths:
  architecture: "docs/SYSTEM.md"
  product: "docs/PRODUCT.md"
  design: "docs/DESIGN.md"
```

That is the shape step 3 produces for the walkthrough above: the identity and path slots are quoted YAML strings, a command is a quoted YAML string, and a gate the repository does not have is the bare `null`.

`AGENTS.md` and every skill reference those values by key and never restate them. That is the whole override story, and it is deliberate: a repository changes its test command by editing its own `.agents/config.yml`, which is a per-repo file — nobody forks the template, and no shared file needs a per-repo branch. It also removes the drift the analysis found in provar, where the same commands appeared in `AGENTS.md`, in a skill, in `package.json` and in CI, and two of the four contradicted each other.

Two rules make it hold:

- **`commands.check` is the wrapper.** One command that runs everything the repo gates on — format, lint, test, build — so a human, an agent and CI cannot diverge. A repository whose CI runs a different sequence than `check` has a bug in the CI.
- **`null` means "this repo has no such gate"**, and every reader must treat it that way. It is the bare YAML `null` — never the string `"null"`, which is a command name, and never an empty string. An agent that invents a command to fill a `null` has broken the convention.

## Adding or changing a skill

1. Copy the block in `TEMPLATE.md` to `.agents/skills/<skill-name>/SKILL.md`.
2. Add it to the skill index in `AGENTS.md` **in the same pull request**.
3. Run `python3 .agents/scripts/validate_agents_config.py`. It fails if the index and the directory disagree, if a front-matter key is missing, or if the skill references a file that does not exist.

Front matter is exactly three keys: `name` (must equal the directory name), `description` (one sentence on what it covers) and `when-to-use` (the trigger, in the reader's words). The `when-to-use` key **is an addition to provar's convention**, which used `name` and `description` only — the analysis asked for a third key precisely because a skill that is not obviously triggered does not get read. Everything else about front matter stays minimal on purpose: no versions, no tool lists, no paths, because nothing consumes them.

Skills are flat until a repository has more than eight of them or two clearly unrelated groups; then group them under `.agents/skills/<group>/<skill>/` and update the index. Five flat skills do not need a taxonomy.

## Upgrading an adopted repository

The convention is versioned by an integer, recorded in `.agents/config.yml` as `convention_version` and in `AGENTS.md` in the opening paragraph, with `adopted_from` holding the commit in `aivara-se/.github` it was copied from. To move a repository to a newer revision: copy the new `AGENTS.md` and `.agents/` over a scratch checkout, re-apply the repository's values from its existing config (steps 2 and 3), keep any repository-specific sections that were merged in at step 1, bump `convention_version` and `adopted_from`, and open the pull request as usual. Do not re-copy blindly — the diff between the two versions is the review artifact.

## What came from provar, and what did not

Kept, generalised:

| Kept                                                                                                                      | Why                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A root `AGENTS.md` as the single entry point, tool-neutral, no vendor manifest                                            | It is what an agent reads first, and it costs nothing to keep true                                                                                                                                                                                                                                |
| The section order — status → focus → roles → how work moves → clarifying → tooling → version control → structure → skills | The ordering rationale survives the language change: temporary steering before standing rules, "ask first" before commands, the skill index last. Roles and how work moves are the two added sections, placed directly after the focus because who does the work is read before any rule about it |
| `## Current Project Focus`                                                                                                | Turns steering that would otherwise be repeated in chat into a reviewable statement                                                                                                                                                                                                               |
| Per-language command bullets, `ALWAYS`/`Never` instead of "consider"/"prefer"                                             | Rules that admit no judgement are marked as such                                                                                                                                                                                                                                                  |
| Conventional Commits, lowercase hyphenated branches, no merge commits                                                     | Org-wide policy, not repo-specific                                                                                                                                                                                                                                                                |
| A repo map with an explicit "where does new markdown go" rule                                                             | It is the cheapest guard against documentation sprawl — provided the map is true                                                                                                                                                                                                                  |
| `.agents/skills/<name>/SKILL.md` with minimal YAML front matter                                                           | No registry, no tooling, discoverable by reading one file                                                                                                                                                                                                                                         |
| Splitting skills by concern (coding / testing / writing), not by language                                                 | The concerns are stable across a polyglot org; the languages are not                                                                                                                                                                                                                              |
| `resources/` next to a `SKILL.md` for supporting files                                                                    | Simple, and it needs no index                                                                                                                                                                                                                                                                     |
| The fixed five-section review output schema                                                                               | The most transferable idea in provar: it makes two reviewers' reports comparable                                                                                                                                                                                                                  |
| A "Pre-Completion Verification" section inside a skill                                                                    | "What to run before you say done" belongs where the work happens                                                                                                                                                                                                                                  |
| One wrapper command that humans, agents and CI all run                                                                    | Removes command drift between config, docs and CI                                                                                                                                                                                                                                                 |

Added, because provar has none of it: agent roles; the task/handoff/review protocol; `when-to-use`; a skill index that a checker keeps true; the per-repo override file; convention versioning; a review verdict vocabulary; and an explicit statement of what an agent may do unasked (branch, push, PR, run the repo's commands — nothing else).

Dropped: all product prose and the domain-model freeze; the Go-specific rules (standard-library-first, `panic` policy, `any` avoidance, naming and comment conventions); the "no empty lines inside a function body" house style; every literal command; the monorepo map and the `docs/SYSTEM.md` filename it got wrong; the provar-flavoured README scaffolds.

Four defects in provar are deliberately not inherited, each cited in the analysis:

1. **Two package managers, one instruction** — `AGENTS.md` mandates Bun while `package.json` declares `npm@11.17.0` and CI runs `npm`. Here the package manager is declared once, in `.agents/config.yml`.
2. **A skill's resources unreachable from the skill** — provar's writing skill shipped two README templates that nothing referenced. Here every skill names the files it ships, and the checker fails when a referenced file is missing.
3. **The review prompt is never referenced** — provar's `.agents/prompts/code-review.md` was invisible from `AGENTS.md`. Here `AGENTS.md` and the `review` skill both point at it.
4. **A map that names a file which does not exist** — one rule covers it: fix the map in the same pull request. The checker also fails on a referenced path that does not resolve.
