# aivara-se — agent-config rollout targets

Generated 2026-09-24T12:18:13Z by MiMi, kanban task `t_29484e8b`.
Machine-readable companion: [`aivara-se-rollout-targets.json`](aivara-se-rollout-targets.json).
Home repository for this programme: **`aivara-se/.github`** — org-scoped, no product code, so the
`reports/` and `templates/agents-config/` artefacts of the rollout live here rather than in a site repo.

## Headline numbers

| Measure | Count |
|---|---|
| Repositories scanned in `aivara-se` | **7** |
| In scope for the AGENTS.md + `.agents/skills/` rollout | **7** |
| Already configured (has `AGENTS.md`, `CLAUDE.md` or `.agents/`) | **5** |
| In scope but missing `AGENTS.md` | **2** |
| In scope but missing `.agents/` | **7** |
| Excluded | **0** |

## Exclusions

**There are none, and that is worth stating plainly rather than leaving blank.** All
7 repositories in the organisation are in scope: none is archived, and
`gh api repos/aivara-se/<repo> --jq .permissions.push` returns `true` for every one of them (authenticated
as `thani-sh-mimi`, scopes `repo`, `read:org`, `gist`, `workflow`). Nothing was dropped, so nothing needs
an explanation here. The JSON still carries `inScope`, `isArchived`, `hasPushAccess` and
`excludedReason` per repo so a later re-run can record an exclusion in the same shape.

## What already exists

- **`AGENTS.md` is present in 5 of 7 repos — and all five copies differ.** The blob SHAs
  are distinct (`bot-mama` `7758ea27e3d305e47b2c416adbb9697cda61b9e9`, `bot-meme`
  `66a479624a83550d73d724011525a66db3bdf179`, `bot-mimi` `cdf6ee29d25447643dcc40410024d167990f9014`,
  `bot-momo` `085c1e1914029e7b56852870d676c367c0d46b48`, `bot-website`
  `45f35fbf159fb8ecda8c7ce8da010f875bdc459a`), so each is repo-specific prose rather than a shared
  copy. **The rollout must merge into these files, never overwrite them.**
- **No repo has `CLAUDE.md`.**
- **No repo has a `.agents/` directory.** The skills convention is new everywhere in this organisation,
  so there is no pre-existing skills content to reconcile and no ambiguity about what to keep.
- `bot-website` is the upstream **template** for the four bot sites
  (`gh api -X POST repos/aivara-se/bot-website/generate`). Its `AGENTS.md`
  ("AGENTS.md — using this template": seven numbered steps plus an Always/never section) is the closest
  thing the org already has to a generalised agent document, and is worth reading before a template
  replaces or absorbs it.
- All seven repos use `main` as the default branch, and none of those branches is protected.

## Target list

| Repo | Language | AGENTS.md | .agents/ | test | check | build |
|---|---|---|---|---|---|---|
| `.github` | none | **no** | **no** | `—` | `—` | `—` |
| `aivara.se` | Svelte | **no** | **no** | `bun test` | `bun run check` | `bun run build` |
| `bot-mama` | HTML | yes | **no** | `./scripts/verify-site.sh` | `./scripts/verify-site.sh` | `—` |
| `bot-meme` | HTML | yes | **no** | `./scripts/verify-site.sh` | `./scripts/verify-site.sh` | `—` |
| `bot-mimi` | HTML | yes | **no** | `./scripts/verify-site.sh` | `./scripts/verify-site.sh` | `—` |
| `bot-momo` | HTML | yes | **no** | `./scripts/verify-site.sh` | `./scripts/verify-site.sh` | `—` |
| `bot-website` | HTML | yes | **no** | `./scripts/verify-site.sh` | `./scripts/verify-site.sh` | `—` |

Per-repo notes, where something needs care:

- **`aivara.se`** — no agent configuration at all, and the only repo with a real toolchain: SvelteKit +
  Vite on Cloudflare Pages (`adapter-cloudflare`), `bun@1.4.2` pinned through `packageManager` with
  `.npmrc` `engine-strict=true`. Tests run with `bun test` (`src/lib/data/projects.test.ts`),
  formatting is gated by `bun run format:check`, type check by `bun run check`. Its CI
  (`.github/workflows/checks.yml`) runs install → `bun run check` → `bun run format:check` →
  `bun run build` but **never `bun test`**, so the test script exists and no pipeline exercises it —
  worth fixing when the repo adopts the configuration. Its docs sit at the repo root (`DESIGN.md`,
  `PRODUCT.md`), not in `docs/` as on the bot sites.
- **`bot-mama`, `bot-meme`, `bot-mimi`, `bot-momo`, `bot-website`** — static HTML with inline CSS: no
  build step, no dependencies, no JavaScript, no third-party requests. The single automated check is
  `./scripts/verify-site.sh`, **byte-identical in all five repos** (blob
  `8430480e08fe29d2e1b2a9aa8f4477b3a674e82f`), as are `docs/DESIGN.md`, `docs/PRODUCT.md`,
  `docs/SYSTEM.md` and `assets/fonts/`. Only `AGENTS.md`, `README.md`, `assets/avatar.webp`,
  `index.html` and `log.html` differ between them. Deployment is GitHub Pages from `main`.
- **`.github`** — org profile repo, `README.md` only, no tooling; the proposed home for the org-wide
  `reports/` and `templates/agents-config/` artefacts.

## How this list was produced

```bash
gh repo list aivara-se --limit 1000 \
  --json name,description,isArchived,primaryLanguage,defaultBranchRef,updatedAt
gh api repos/aivara-se/<repo>                                    # .permissions.push, .pushed_at
gh api 'repos/aivara-se/<repo>/git/trees/<branch>?recursive=1'   # presence of every path
```

File presence was read from the git tree of each repo's default branch (one call per repo characterises
the whole tree) instead of probing individual paths. Every tree reported `"truncated": false`, so each
path list is complete and a `hasAgentsFile: false` result really means the file is absent rather than
merely not listed. `language` is GitHub's own `primaryLanguage`. The `test`/`check`/`build` commands in
the table come from reading the tooling files themselves — `package.json` scripts,
`.github/workflows/checks.yml`, `scripts/verify-site.sh` — not from inferring them from the language.
Nothing in this document is estimated; every row is reproducible with the three commands above.
