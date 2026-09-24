# Audit of the `aivara-se` agent-config rollout

Independent verification of the rollout logged in `reports/aivara-se-rollout-log.md`
(PR aivara-se/.github#5) against the target list `reports/aivara-se-rollout-targets.json`
(PR aivara-se/.github#2).

- **Auditor:** MeMe (`meme@aivara.se`, GitHub `thani-sh-meme`), kanban task `t_218835de`.
- **Date:** 2026-09-24.
- **Method:** fresh clones of all seven repositories at the audited revisions; the log's
  inputs read from their real branches (neither is on `main`); every claim below re-run
  locally rather than taken from the log; the convention's own checker re-run, plus an
  independent YAML parse and index cross-reference written for this audit.
- **Nothing here is a re-print of the rollout log.** Where the log and this audit agree,
  the audit says how it was re-established.

## Verdict per target

| # | Repository | Branch `chore/adopt-agents-config` | Pull request | Classification |
|---|---|---|---|---|
| 1 | `aivara-se/.github` | `376863f` | [#4](https://github.com/aivara-se/.github/pull/4) (open, base `main`) | **pass with findings** — see F2, F4 |
| 2 | `aivara-se/aivara.se` | `41e256b` | [#8](https://github.com/aivara-se/aivara.se/pull/8) (open, base `main`) | **pass with findings** — see F3, F4 |
| 3 | `aivara-se/bot-mama` | `c80afc8` | none possible | **skipped with reason** — F6 (repo flag, not the diff) |
| 4 | `aivara-se/bot-meme` | `b1dd192` | none possible | **skipped with reason** — F6 |
| 5 | `aivara-se/bot-mimi` | `0e20380` | none possible | **skipped with reason** — F6 |
| 6 | `aivara-se/bot-momo` | `67c4918` | none possible | **skipped with reason** — F6 |
| 7 | `aivara-se/bot-website` | `5f12769` | none possible | **skipped with reason** — F6 (plus F5 on its declared gate) |
| — | rollout log | `docs/rollout-log` `240e960` | [#5](https://github.com/aivara-se/.github/pull/5) | pass — see F4 (reviewer only) |
| — | rollout targets | `inventory/aivara-se-repos` | [#2](https://github.com/aivara-se/.github/pull/2) | pass |

**All seven repositories in the targets JSON are accounted for: 0 unverified, 0 missing,
0 unexplained failures.** No target was excluded and none was silently dropped.

## What was independently established

1. **Branches exist at the logged heads.** `git ls-remote` per repository: `.github`
   `376863f`, `aivara.se` `41e256b`, `bot-mama` `c80afc8`, `bot-meme` `b1dd192`,
   `bot-mimi` `0e20380`, `bot-momo` `67c4918`, `bot-website` `5f12769` — every one matches
   the log, and every local clone checked out to the same commit.
2. **The two adoption PRs are real, open, and target the default branch.** `gh pr view`
   returns `baseRefName: main`, `state: OPEN` for #4 (10 added files) and #8 (11 added
   files); both carry `AGENTS.md` and `.agents/skills/*/SKILL.md` at the expected paths,
   and `aivara.se#8` additionally modifies `.prettierignore`.
3. **`has_pull_requests` and the five skips (F6).** `gh api repos/aivara-se/<repo> --jq
   .has_pull_requests` → `false` on all five `bot-*`, `true` on `.github` and `aivara.se`;
   `is_template` → `true` on `bot-website` only; `permissions.push` → `true` on all seven.
   Reproduced the refusal directly: `gh api -X POST repos/aivara-se/bot-mama/pulls …`
   returns `{"message":"Not Found","status":404}`, and no pull-request object exists
   afterwards (`gh pr list --repo aivara-se/bot-mama --state all` → `[]`). The skip is
   environmental, not a defect in the branch or the diff.
4. **Placeholders substituted.** `git grep '{{' -- AGENTS.md '.agents/**'` prints nothing
   on all seven branches. Scoped correctly to the files this change owns — repositories
   have pre-existing `{{` in `bot-website`'s `index.html`/`log.html` and in
   `scripts/verify-site.sh` that this rollout does not create or touch.
5. **Convention checker passes.** `python3 .agents/scripts/validate_agents_config.py` →
   `ok 5 skill(s) indexed and valid; paths resolve; config complete.`, exit 0, all seven.
6. **Front matter, parsed independently (not by the shipped checker).** A separate script
   (`yaml.safe_load` on the delimited front matter of every `SKILL.md`) found on all seven
   branches: 5 skills on disk, every front matter a valid mapping, exactly the keys
   `description` / `name` / `when-to-use`, `name` equal to the directory, `description` and
   `when-to-use` non-empty. **Zero problems.**
7. **Skill index cross-checked both ways.** Every `- .agents/skills/…/SKILL.md` line in
   `AGENTS.md` resolves on disk, and every `SKILL.md` on disk is listed. No missing entry,
   no orphan file.
8. **No forks.** SHA-256 of every file under `.agents/` across all seven trees: the review
   prompt, the checker, all five skills and `writing/resources/readme-template.md` are
   byte-identical in all seven. Only `.agents/config.yml` and `AGENTS.md` differ, which is
   exactly the per-repository override surface. Compared against the template on
   `design/agents-template`, the only difference outside those two files is the substituted
   `main`/reviewer text in `repo-workflow/SKILL.md` (lines 28 and 30) — a substitution, not
   an edit.
9. **No existing instruction was deleted.** For the five repositories that had an
   `AGENTS.md`, every non-blank line of `origin/main:AGENTS.md` was re-tested against the
   branch file, allowing only the announced two-level heading demotion: 48/48 for
   `bot-mama`, `bot-meme`, `bot-mimi`, `bot-momo`; 105/114 for `bot-website` — and the nine
   are exactly the lines that documented the site's own `{{TOKEN}}` placeholders, all seven
   table rows present with the braces removed and both sentences present in reworded form
   (see F8). **306 original non-blank lines, 0 lost.** The pre-change blob SHAs quoted in
   the log match `origin/main` for all five.
10. **No default branch was touched.** `origin/main` carries no `.agents/` in any of the
    seven, and the five `AGENTS.md` blobs on `main` still hash to the values in the
    inventory (`7758ea27…`, `66a47962…`, `cdf6ee29…`, `085c1e19…`, `45f35fbf…`).
11. **Commit hygiene.** Each adopted branch is exactly one commit
    (`chore: adopt aivara-se agent configuration`), single parent (no merge commit), authored
    and committed by `MoMo <momo@aivara.se>` — the agent's own identity, as the convention
    requires.
12. **Native gates actually run (step 3 of the audit brief).** Two repositories were run
    locally, not just read:
    - **`aivara.se`** — `bun install --frozen-lockfile` (bun 1.4.2), then all four declared
      commands on the branch tree: `bun run check` → `svelte-check found 0 errors and 0
      warnings`; `bun test` → `6 pass, 0 fail`; `bun run build` → built; `bun run
      format:check` → `All matched files use Prettier code style!`. Its real CI agrees
      (`gh pr checks 8`: `checks` pass in 27s, Cloudflare Pages pass).
    - **The five static sites** — `./scripts/verify-site.sh` on the branch: exit 0 for
      `bot-mama`, `bot-meme`, `bot-mimi`, `bot-momo`; exit 1 with 3 failures for
      `bot-website`. The `bot-website` failure was then compared with its `origin/main`
      baseline in a separate worktree: **byte-identical output**, so the rollout neither
      caused nor hid it. (`bot-mama`'s main baseline was also exit 0.)
    - Not verified: nothing. The two un-runnable cases in the log (`bot-*` PR bodies) do not
      exist as commands to run; there is no native gate in `.github`.
13. **The `aivara.se` `.prettierignore` edit is justified, not a workaround for a mistake.**
    Running `prettier --check --ignore-path /dev/null AGENTS.md .agents` on the adopted tree
    flags exactly `.agents/config.yml` and `.agents/prompts/code-review.md` — the same two
    files the log names — and nothing else (`AGENTS.md` itself is already clean). Ignoring
    the copied tree is the right call against per-repository reformatting; the underlying
    untidiness belongs in the template (F7).

## Findings

Priority: **P1** blocks a merge or makes a landed file false; **P2** is a real
non-conformance that should be decided; **P3** is cosmetic or informational.

### F1 — P1 — the template's command slots turn `null` into the string `"null"` (PR #3)

**Where:** `templates/agents-config/.agents/config.yml` lines 20–24
(`check: "{{REPO_CHECK_COMMAND}}"` … `ci_workflow: "{{REPO_CI_WORKFLOW}}"`), against
`templates/agents-config/README.md` step 2 ("a command this repo does not have is the
literal `null`") and the file's own comment on line 18.

**Verified independently, verbatim.** The README's own step-3 script was extracted from the
README and run unmodified on a dummy tree: `substituted 9 files`, exit 0, and the result
line reads `test: "null"` — which `yaml.safe_load` returns as the **string** `'null'`, not
`None`. The shipped checker still exits 0 (`ok 5 skill(s)…`), so the defect ships silently.
The adopted repositories avoid it by writing a bare `null`; that deviation is correct and
the config file is the sanctioned place for it, but a second adopter following the README
literally reintroduces the string.

**Fix:** unquote the five slots in the template (the README already forbids double quotes
inside command values, so plain scalars are safe), or have the substitution script emit a
bare `null` when the value is the literal `null`; and add a checker assertion that these
five keys parse as `str` or `None`, never the string `"null"`. Then the next adoption needs
no deviation. Already reported on #3; this audit re-derives it from the README's own script
rather than from a hand-built example.

### F2 — P1 — the `AGENTS.md` repository map in PR #4 names two directories that do not exist

**Where:** `AGENTS.md` lines 59–60 in PR aivara-se/.github#4:

    - `templates/agents-config/`: the agent configuration every repository in this organisation copies
    - `reports/`: programme reports, one file per question asked

Neither path exists in that branch's tree (branch root: `AGENTS.md`, `README.md`, `.agents/`)
nor on `main` (branch root: `README.md`) — checked against the actual checkout, not against
the log. The file's own rule, three lines below (line 64), says: "If a path in the
map above stops being true, fix the map in the same pull request. A map that lies is worse
than no map." — and this map is false the moment #4 lands alone.

**Fix (either):** land #2 (`reports/`) and #3 (`templates/agents-config/`) before #4, and
record that merge order in the log; or drop those two rows from #4 and add them in the pulls
that actually create the directories. As it stands, merging #4 first publishes a lying map.

### F3 — P2 — `aivara.se` declares a `check` that is not the wrapper, and `bun test` runs nowhere (PR #8)

**Where:** `aivara.se/.agents/config.yml` lines 20–23 against
`aivara.se/.github/workflows/checks.yml` lines 19–28 and `package.json` `scripts`.

Declared: `check: "bun run check"`, `test: "bun test"`, `lint: "bun run format:check"`,
`build: "bun run build"`. CI runs `bun install --frozen-lockfile`, `bun run check`,
`bun run format:check`, `bun run build` — **not `bun test`** — and `bun run check` is only
`svelte-kit sync && svelte-check`. The convention (`AGENTS.md` lines 42–43) makes `check`
the single wrapper that humans, agents and CI all run, and calls a CI that runs a different
sequence "the bug". Here there are three distinct sequences and one declared gate that
nothing ever executes.

**Fix:** add a wrapper (e.g. `check:all` = `bun run check && bun run format:check && bun test
&& bun run build`) and make both the CI file and `commands.check` call it — or, if the
narrower `check` is wanted, say so explicitly in the repository's `AGENTS.md` so the next
agent does not read `check` as the full gate. Flagged in #8 already; the audit confirms it
against the real files and adds the line references. This is the one target whose CI the
convention also covers, so it is worth settling before #8 merges.

### F4 — P2 — the rollout's own PRs request review from the operator only, not "the operator and one peer agent"

**Where:** the convention text the PRs introduce — `AGENTS.md` line 54 (`.github`, `aivara.se`),
line 125 (`bot-mama`, `bot-meme`, `bot-mimi`, `bot-momo`) and line 216 (`bot-website`) — says a
pull request must "request review from the operator (`thani-sh`) and one peer agent".

- aivara-se/.github#4: `reviewRequests: ["thani-sh"]` — no peer agent.
- aivara-se/aivara.se#8: `reviewRequests: ["thani-sh"]` — no peer agent.
- aivara-se/.github#5: `reviewRequests: ["thani-sh"]` — no peer agent.
- aivara-se/.github#2: `["thani-sh", "thani-sh-mama"]` — compliant.

**Fix:** add one peer agent as a reviewer on #4, #5 and #8 (e.g. `thani-sh-mama`,
`thani-sh-momo`, `thani-sh-mimi`, `thani-sh-meme`). Trivial, but it is the rule these pull
requests are landing, and the first two PRs to land under it should obey it.

### F5 — P3 — `bot-website`'s declared gate is red on `main` and stays red

**Where:** `bot-website/.agents/config.yml` line 20 (`check: "./scripts/verify-site.sh"`).
The script exits 1 with 3 failures because the template repository's pages still carry their
placeholder tokens; verified byte-identical between `origin/main` and the branch. The
declaration is honest (the repository does have a gate, and it is that script), but the
convention's "ALWAYS run `commands.check` on the final tree" cannot be satisfied here.
**Decision needed from the operator:** accept it as a documented template exception in that
repository's `AGENTS.md`, or make the script exit 0 when the placeholders are intentional.

### F6 — operator action — the five `bot-*` repositories cannot take pull requests

Environment, not a rollout defect (see "What was independently established" §3). The five
branches are pushed and verified; only the pull-request object is missing. Remedy is the
`has_pull_requests=true` flip in the log's "The five skips" section, `bot-website` first so
future generated sites inherit it. **The five are classified skipped-with-reason, not
failed.** Note for the operator: once flipped, the five PRs are one command each, with bodies
ready in the log.

### F7 — P3 — the template's copied tree is not prettier-clean

`prettier --check` on the copied tree flags `.agents/config.yml` and
`.agents/prompts/code-review.md` (reproduced above in §13). Any adopter whose gate formats
the whole repository inherits a red check on files it must not reformat. Worth fixing in the
template so adopters do not each need a `.prettierignore` edit.

### F8 — P3 — one line of the log overstates what was preserved in `bot-website`

The log says the two affected sentences are "written without the braces". They are in fact
**reworded** — each gains a clause explaining why the braces were dropped (e.g. `AGENTS.md`
line 50 in bot-website: "…they are written here without their braces because the agent
convention reserves the double-braced form for its own slots"). The seven table rows are
brace-stripped only. The substance is preserved and disclosed, but the log's wording should
read "reworded" for those two lines, since a reviewer comparing bytes will otherwise find a
discrepancy the log has denied.

### F9 — P3 — `aivara.se`'s `.prettierignore` also ignores `AGENTS.md`, which is already clean

`AGENTS.md` is not flagged by prettier on the adopted tree; only the two `.agents/` files
are. Ignoring it is harmless and self-consistent (the file is shared and must not be
reformatted per repository), so this is informational, not a defect.

## Prioritized remediation

1. **Merge order (F2).** Do not land `.github#4` before `#2` and `#3`; otherwise the
   repository map it publishes is false. Either sequence the merges or trim lines 59–60.
2. **Fix the template's `null` slots (F1, #3)** before any second adopter follows the README
   verbatim. Add the checker assertion so it cannot regress.
3. **Settle `aivara.se`'s wrapper (F3, #8)** — add `check:all` and point CI and
   `commands.check` at it, or document the narrower contract in that repository's `AGENTS.md`.
4. **Add one peer reviewer to #4, #5, #8 (F4)** — the rule those PRs land.
5. **Operator: flip `has_pull_requests` (F6)** on the five `bot-*`, `bot-website` first, then
   open the five held PRs from the log.
6. **Operator decision on `bot-website`'s permanently-red gate (F5).**
7. **Fix prettier cleanliness in the template (F7)**, so adopters stop needing a local
   `.prettierignore` edit.
8. **Correct one sentence in the rollout log (F8)** — "reworded", not just "without braces".

## PRs needing changes

| PR | Needs | Findings |
|---|---|---|
| aivara-se/.github#3 (template) | Yes | F1 |
| aivara-se/.github#4 (adoption in `.github`) | Yes | F2, F4 |
| aivara-se/aivara.se#8 (adoption in `aivara.se`) | Yes | F3, F4 |
| aivara-se/.github#5 (rollout log) | Yes (reviewer only) | F4, F8 |
| aivara-se/.github#2 (targets) | No | — |

## Reproduce this audit

```sh
# branches at the audited revisions
for r in .github aivara.se bot-mama bot-meme bot-mimi bot-momo bot-website; do
  gh repo clone aivara-se/$r && git -C $r fetch origin chore/adopt-agents-config
  git -C $r checkout --detach FETCH_HEAD
done
# placeholders, checker, front matter, index, forks, preservation
git grep -n '{{' -- AGENTS.md .agents/        # expect no output
python3 .agents/scripts/validate_agents_config.py   # expect exit 0
# native gates
(cd aivara.se && bun install --frozen-lockfile && bun run check && bun test \
  && bun run build && bun run format:check)
(cd bot-meme && ./scripts/verify-site.sh)     # exit 0
(cd bot-website && ./scripts/verify-site.sh)  # exit 1, 3 failures — identical on main
# the skip cause
gh api repos/aivara-se/bot-mama --jq .has_pull_requests          # false
gh api -X POST repos/aivara-se/bot-mama/pulls -f title=x -f head=chore/adopt-agents-config -f base=main  # 404
```

_Audit scripts written for this task: `check_skills.py` (front matter + index),
`check_maps.py` (repository maps vs the tree), `check_forks.py` (cross-repo file hashes),
`check_preserved.py` (nothing deleted), `repro_null.py` (F1)._
