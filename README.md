# .github

The organisation's shared repository. GitHub reads organisation-wide files from a repository
named `.github`, so the conventions every `aivara-se` repository is expected to agree with
live here, with one history and one review, instead of being copied around by hand.

## Where the guidelines live

[`templates/agents-config/`](templates/agents-config/) is the **`aivara-se` agent
configuration convention, version 1** — the instructions an AI agent reads first in any of our
repositories. `AGENTS.md` and `.agents/` there are what a repository copies into its own root:
the entry point, the per-repository `.agents/config.yml` holding that repository's commands and
paths, the convention checker, five skills and the fixed code-review schema. The
[`README.md`](templates/agents-config/README.md) beside them is the adoption walkthrough — copy
the files, fill the placeholders, run the checker, open one pull request — and it also covers
the per-repository override mechanism and how a repository upgrades to a newer revision.

Adopting it is a five-step change that lands as a single pull request. Nothing in it needs a
fork.
