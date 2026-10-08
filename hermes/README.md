# Hermes

Org-level Hermes Agent configuration for Aivara. One copy lives here; every
host and every agent reads from it — nothing is pasted into individual agents.

## Layout

```text
hermes/
  README.md                  this file
  plugins/
    aivara-skills/           Agent Plugins v1 package (installable)
      plugin.json            package manifest
      skills/
        coding/SKILL.md      code quality rules a formatter cannot enforce
        review/SKILL.md      how to review another agent's change + verdict schema
        testing/SKILL.md     what to test, where tests live, how to run them
        writing/SKILL.md     docs that ship with the code + README rules
          resources/readme-template.md
```

The four skills mirror `templates/agents-config/.agents/skills/` — the same
texts repositories carry in `.agents/skills/`. Keep them byte-identical; the
template copy is canonical for repo adoption, this copy is canonical for hosts.

## Install on a host (all profiles)

```sh
hermes plugins install --enable aivara-se/.github#hermes/plugins/aivara-skills
for p in mama meme mimi momo; do
  hermes --profile $p plugins install --enable aivara-se/.github#hermes/plugins/aivara-skills
done
```

Skills resolve as `aivara-skills:coding` etc. via `skill_view()` and appear in
`skills_list`. Remove a same-named local skill first if one exists — local
copies shadow the plugin and silently win.

## Updating

```sh
hermes plugins update aivara-skills
```

Then re-run for each profile. Changes land on the next session start.
