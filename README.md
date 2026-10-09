# .github

The organisation's shared repository. GitHub reads organisation-wide files from a repository named
`.github`, so the conventions every `aivara-se` repository is expected to agree with live here, with one
history and one review, instead of being copied around by hand.

## The agent configuration lives in [`aivara-se/.agents`](https://github.com/aivara-se/.agents)

The agent configuration convention (version 2) and the organisation's skills moved to their own repository:

- [`agents/`](https://github.com/aivara-se/.agents/tree/main/agents) — one file per agent: root, mama,
  meme, mimi, momo.
- [`skills/`](https://github.com/aivara-se/.agents/tree/main/skills) — coding, review, testing and
  writing; read by every agent through `skills.external_dirs`, so a skill changes once and every agent
  reads the new text on its next turn.
- [`templates/AGENTS.md`](https://github.com/aivara-se/.agents/blob/main/templates/AGENTS.md) — the donor
  entry file a repository copies when it adopts the convention, and
  [the README](https://github.com/aivara-se/.agents/blob/main/README.md) beside it is the adoption
  walkthrough: what gets copied and what stays, the twelve slots, how to add a skill, and how an adopted
  repository moves to a newer revision.

Nothing an agent reads for its work is left in this repository; it was moved here from
`templates/agents-config/`, which no longer exists.
