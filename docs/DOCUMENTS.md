# Document standard

`PRODUCT.md` and `SYSTEMS.md` are contracts. Each follows a fixed set of headings, in a fixed order, inside a word budget. `README.md` and `DESIGN.md` have a shape and no budget. A heading with nothing to say keeps its place and says `None`.

Effective 2026-11-04. An existing document comes into line at its next change.

## Why

Free text mixes statements that live for different lengths of time: the goal, this version's rules, the mechanism, and the history of decisions. An agent cannot tell which sentence limits it, so it obeys a rule that moved, or invents one that was never decided.

The headings name the lifetime of each statement. The budget forces the author to keep the rule that matters.

## One fact, one home

| The question                                  | The document |
| --------------------------------------------- | ------------ |
| Why does this exist, and who is it for?       | `PRODUCT.md` |
| What must hold in this version?               | `PRODUCT.md` |
| How is it shaped, and what does it depend on? | `SYSTEMS.md` |
| What does a person see, and with what values? | `DESIGN.md`  |
| What must hold in every repository?           | `AGENTS.md`  |
| Why this way, and what did it cost?           | ADR          |
| What is being built now?                      | issue        |
| Does it work?                                 | test         |

A sentence that answers two questions belongs in one document, and the other links to it. A word that leaves a document moves to an ADR, an issue, a test or a release. It is not deleted.

## PRODUCT.md

The document states the goal and the boundary. An agent reads it to learn what it may change.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Problem` | 90 | The person, the cost, and why now. The last paragraph says what the product is. |
| `## Scope` | 110 | Three lists: `In`, `Not this version`, `Never`. |
| `## Behaviour` | 250 | The rules a person can see. One rule per bullet, 25 words or fewer. |
| `## Autonomy` | 50 | What an agent decides alone, and what needs a decision. |
| `## Vision` | 40 | What this becomes, and what must not change on the way. |
| `## Acceptance` | 60 | At most eight outcomes, each checkable by someone else. |

Total: 600 words.

Rules:

- `## Problem` names the pain, not the feature. Its last paragraph says what the product is, and who uses it and who runs it. If the product is the answer, the question is missing.
- `## Scope` gives each list its lifetime. `In` is this version's work. `Not this version` is deferred and may return. `Never` is refused in every version. An agent reads this one section to learn what it may change.
- `## Behaviour` holds rules, not mechanisms. A rule that needs a mechanism sends the reader to `SYSTEMS.md`.
- `## Autonomy` names what an agent decides alone: anything these two documents do not fix, inside the scope. It names what needs a decision first: a new dependency, a change to the data model, a change to an external interface, or anything `Never` forbids.
- A rule the work needs and the document lacks is written here in the same pull request. The budget decides whether it stays.
- `## Acceptance` is the proof: eight outcomes at most, each checkable by someone else. This list is enough; no other document repeats it.
- The product document keeps no changelog and no roadmap. What shipped, and when, is the release record.

## SYSTEMS.md

The system document is the shape of the running thing, in three parts.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Architecture` | 180 | The parts and what each is responsible for, the data they share, and the boundary each exposes. |
| `## Dependencies` | 40 | What it needs and why. One line each. |
| `## Failure modes` | 80 | One line per failure a person can meet, and what happens. |

Total: 300 words.

Rules:

- `## Architecture` stays above the code. A part is a responsibility with a boundary, not a package; the data is the model, not the schema; a boundary states its contract, not its transport.
- "One row per day, keyed by the local date" is data; a column list is implementation.
- No config keys, no DDL, no file-by-file functions, no test, plan or decision.

## README.md

A README answers four questions, in this order: what the repository is, how to run it, how to use it, and how to check it. `writing-readmes.md` in `aivara-se/.agents` holds the shape.

There is no budget. The four answers are short.

## DESIGN.md

`DESIGN.md` holds the interface's fixed values: geometry, type, colour and motion. It follows Google's DESIGN.md format, whose specification is at <https://stitch.withgoogle.com/docs/design-md/overview>. `writing-design-doc.md` in `aivara-se/.agents` holds the prose rules.

There is no budget. Tokens are data.

## AGENTS.md

A repository's entry file is `AGENTS.md` at its root, and it is the same file in every repository: [ENTRY.md](ENTRY.md), copied without a change.

It states only what does not move: the documents to read, the rules that hold everywhere, and how work lands. What a repository is belongs in its `README.md` and `PRODUCT.md`. How it is shaped belongs in its `SYSTEMS.md`. A rule that must differ per repository goes in `SYSTEMS.md`, so the entry file never needs an edit.

The copy is checked, not trusted. `scripts/validate-agents.ts` compares it with the standard byte for byte and names the first differing line. Its test holds this repository's own copy equal to the standard.

A repository adopts the file by copying it and adding `.github/workflows/validate-agents.yml` as a job in its `validate` workflow. An agent that needs a rule change edits `ENTRY.md`; every repository follows at its next merge.

Rejected:

- **Slots filled per repository.** Six slots are six decisions at every adoption, and two copies already differ.
- **No entry file.** A skill loads when a task matches its `when-to-use`. Nothing matches when an agent opens a repository for the first time.

## Enforcement

`scripts/validate-docs.ts` implements this standard. It fails on a heading that is missing, unknown, duplicated or out of order; a section over its cap; a section with no text; a relative link that does not resolve; and twelve consecutive words that both documents carry, compared with case and punctuation removed.

The message carries the number: `PRODUCT.md § Behaviour: 412 words, cap 250`.

A word is a whitespace-separated token of prose, list text or table cell. A heading, fenced code, link target, HTML comment and table rule do not count. `None` is text, so the section is not empty.

A repository adds `.github/workflows/validate-docs.yml` as one job in its `validate` workflow, in the pull request that brings its documents into line. The job fails when either document is missing.

The checker reads the pair from the repository root, then from `docs/`. The root wins when both layouts carry a copy.

The document checker is one of two reusable workflows; the other checks the entry file. Each repository carries its own build and release, because a shared one lands every change everywhere. A checker is the opposite case: two copies drift, and the convention then differs by repository with nobody seeing it. It changes only in a pull request that changes this document.

Rejected:

- **A copy of the script in each repository.** No shared failure, but the copies drift.
- **A test on prose style.** An agent satisfies it by deleting the rule.
- **Headings with no budget.** Cheaper to adopt, and the long document stays long.

## What would kill it

A budget so tight that a rule leaves the document. The agent then invents it at the point of use, and the document becomes less true than the free text it replaced.

The cap is a ceiling, not a target. When a section is full and a rule is missing, the author removes an old rule or takes a decision.
