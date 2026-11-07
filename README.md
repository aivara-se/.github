# .github

The organisation's shared repository. GitHub reads organisation-wide files from a repository named `.github`, so the files that apply to every `aivara-se` repository live here, once, under one history and one review, instead of being copied around by hand.

## What lands here

- The default community health files GitHub serves to a repository that does not carry its own: issue and pull request templates, `CONTRIBUTING.md`, `SECURITY.md`.
- Workflow defaults that every repository is expected to agree with.
- The organisation's release standard, [docs/RELEASES.md](docs/RELEASES.md)
- The organisation's document standard, [docs/DOCUMENTS.md](docs/DOCUMENTS.md): `PRODUCT.md`, `SYSTEMS.md`, `README.md`, `DESIGN.md` and `AGENTS.md`.
- The organisation's entry file, [docs/ENTRY.md](docs/ENTRY.md), which every repository carries as `AGENTS.md`.
- The organisation's rules of the road for contributors.

Each file is the only copy of what it says. A rule that applies to one repository belongs in that repository.

## Checks

```sh
bun install --frozen-lockfile
bun fmt --no-script --check .
bun x tsc --noEmit
bun test
```

Run the whole sequence and read every result — the last exit code says nothing about the first. The same commands run in `.github/workflows/validate.yml`, whose job is named `validate`: the check the default branch requires before a merge.

`verify-settings` is not part of the sequence. It reads the live organisation, needs `ORG_READ_TOKEN`, and runs by hand.

## Changing a file here

- Every file here is the only copy of what it says. A change to one is a change to every repository, so name what it affects in the pull request.
- A workflow default is a claim about every repository. Change it when the repositories can follow it, not before.
- A comment beside a step says why the step exists. Delete the comment when the step goes.
