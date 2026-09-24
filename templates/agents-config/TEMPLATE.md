# Skill scaffold

This file is the scaffold for a new skill in the `aivara-se` agent convention. It stays here in the template repository — do not copy it into an adopting repository. Copy the block below into `.agents/skills/<skill-name>/SKILL.md` there, and add the skill to the skill index in that repository's `AGENTS.md` in the same pull request.

Rules for a skill under this convention:

- **One concern per skill.** A reader should be able to act on it, not choose between it and another skill. "Coding" is a concern; "Go coding in the API package" is a section of one.
- **Front matter is exactly three keys.** `name` must equal the directory name; `description` is one sentence on what the skill covers; `when-to-use` is the trigger in the reader's own words. Nothing else — no versions, no tool lists, no paths, because nothing consumes them.
- **Keep it under about 120 lines.** Past that it is either two skills or the detail belongs in `resources/`.
- **Name every file the skill ships.** A `resources/` file, a script or a template that the body does not reference is invisible; provar shipped two README templates in exactly that state. The convention checker fails if a referenced file is missing, and reviewers fail it if an unreferenced one appears.
- **No language or tool specifics.** Commands, paths and the package manager come from `.agents/config.yml`; formatting and linting are the language's own tools. A shared skill that names `go vet` is broken in the next repository.
- **Authoring a skill in a repository is local.** Moving it into `templates/agents-config/.agents/skills/` is an org-wide change: do it when a second repository wants it, in a pull request of its own.

## The block to copy

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

Write the body in the same register as the rest of the convention: imperative, second person, no hedging, no filler, and every rule marked `ALWAYS` or `Never` when it admits no judgement. Every `<...>` in the block is a fill-in: this scaffold stays here and is not part of the substitution in `README.md`, step 3, so nothing replaces it for you.
