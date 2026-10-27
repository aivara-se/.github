# .github

The organisation's shared repository. GitHub reads organisation-wide files from a repository named `.github`, so the files that apply to every `aivara-se` repository live here, once, under one history and one review, instead of being copied around by hand.

## What lands here

- The default community health files GitHub serves to a repository that does not carry its own: issue and pull request templates, `CONTRIBUTING.md`, `SECURITY.md`.
- Workflow defaults that every repository is expected to agree with.
- The organisation's release standard, [docs/RELEASES.md](docs/RELEASES.md), and the tinyjs desktop packaging workflow it provides, `.github/workflows/tinyjs-publish.yml`.
- The organisation's rules of the road for contributors.

Each file is the only copy of what it says. A rule that applies to one repository belongs in that repository.
