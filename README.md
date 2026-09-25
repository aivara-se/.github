# .github

The organisation's shared repository. GitHub reads organisation-wide files from a repository named `.github`, so the conventions every `aivara-se` repository is expected to agree with live here, with one history and one review, instead of being copied around by hand.

## Where the guidelines live

[`templates/agents-config/`](templates/agents-config/) is the **`aivara-se` agent configuration convention, version `2`** — the instructions an AI agent reads first in any of our repositories. What a repository copies into its own root is exactly two things: `AGENTS.md`, the entry file with its twelve slots filled in for that repository, and `.agents/skills/`, the four skills that file indexes. There is no configuration file, no checker script and no prompt file: a repository's commands are written in `AGENTS.md` under "Verify before pushing", and the rules live in the skills. A skill names no file of the convention and points at no other skill — the entry file is what points at them.

The [`README.md`](templates/agents-config/README.md) beside them is the adoption walkthrough: what gets copied and what stays, a five-step walkthrough on a dummy repository, what to do when the repository already has an `AGENTS.md` of its own, how to add a skill, and how an adopted repository moves to a newer revision. Adopting the convention is a single pull request, and nothing in it needs a fork.
