# Document standard

`PRODUCT.md` and `SYSTEMS.md` are contracts. Each follows a fixed set of headings, in a fixed order, inside a word budget. A heading with nothing to say keeps its place and says `None`.

## Why

Free text mixes statements that live for different lengths of time: the goal, this version's rules, the mechanism, and the history of decisions. An agent cannot tell which sentence limits it, so it obeys a rule that moved, or invents one that was never decided.

The headings name the lifetime of each statement. The budget forces the author to keep the rule that matters. Measured on 2026-11-03: `dispatch` 3,974 and 2,621 words, `pereda` 1,411 and 1,110, `.website` 1,370 with no `SYSTEMS.md`.

## One fact, one home

| The question                                  | The document |
| --------------------------------------------- | ------------ |
| Why does this exist, and who is it for?       | `PRODUCT.md` |
| What must hold in this version?               | `PRODUCT.md` |
| How is it shaped, and what does it depend on? | `SYSTEMS.md` |
| Why this way, and what did it cost?           | ADR          |
| What is being built now?                      | issue        |
| Does it work?                                 | test         |

A sentence that answers two questions belongs in one document, and the other links to it.

## PRODUCT.md

The document states the goal and the boundary. An agent reads it to learn what it may change.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Problem` | 60 | The person, the cost, and why now. No solution. |
| `## Users` | 50 | Who uses it and who runs it, in bullets. |
| `## What it is` | 60 | One paragraph a stranger can repeat after one read. |
| `## Scope this version` | 120 | `In` and `Out`, two lists. Out is a promise, not a backlog. |
| `## Behaviour` | 400 | The rules a person can see. One rule per bullet, 25 words or fewer. |
| `## Never` | 100 | Constraints the product holds in every version. |
| `## Autonomy` | 80 | What an agent decides alone, and what needs a decision. |
| `## Vision` | 80 | What this becomes, and what must not change on the way. |
| `## Acceptance` | 120 | At most ten outcomes, each checkable by someone else. |
| `## Roadmap` | 60 | Candidates, not commitments. One line each. |
| `## Changelog` | 60 | The last three versions, one line each. Older lines live in `CHANGELOG.md`. |

Total: 1,200 words.

Rules:

- `## Problem` names the pain, not the feature. If the product is the answer, the question is missing.
- `## Behaviour` holds rules, not mechanisms. A rule that needs a mechanism sends the reader to `SYSTEMS.md`.
- `## Never` is a constraint, not a goal. "Never calls the network" is a constraint; "fast" is not.
- `## Autonomy` names what an agent decides alone: anything these two documents do not fix, inside the scope. It names what needs a decision first: a new dependency, a change to the data model, a change to an external interface, or anything `## Never` forbids.
- A rule the work needs and the document lacks is written here in the same pull request. The budget decides whether it stays.
- `## Acceptance` is outcomes, not tests. The suite owns the per-flow checks.

## SYSTEMS.md

The map of the shape. It cites the ADRs and never copies them.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Shape` | 70 | One paragraph: the components and how they meet. |
| `## Components` | 130 | One line each: name, responsibility, interface. |
| `## Data` | 140 | Entities, identity, relations, invariants. No columns, no types, no indexes. |
| `## Interfaces` | 110 | Each boundary: direction, contract, and how it fails. |
| `## Dependencies` | 60 | What it needs, why, and the decision that fixed it. |
| `## Failure modes` | 120 | One line per failure a person can meet, and what happens. |
| `## Planned, not built` | 70 | Decided mechanisms that are not in the tree. |
| `## Layout` | 50 | The paths a reader needs. No obvious plumbing. |
| `## Decisions` | 70 | Only the ADRs the shape depends on, one line each. |
| `## Checks` | 60 | The commands. |

Total: 880 words.

Rules:

- A component is a responsibility with an interface, not a package.
- `## Data` is the model, not the schema: "one row per day, keyed by the local date" is data; a column list is implementation.
- `## Interfaces` states the contract, not the transport.
- `## Decisions` lists the load-bearing ADRs. The link carries the reason and the cost.
- No config keys, no DDL, no file-by-file functions, no command outside `## Checks`.

## Enforcement

`scripts/check-docs.ts` runs from `.github/workflows/docs.yml`, which a repository calls as one job in `validate`.

It fails on a heading that is missing, unknown or out of order; a section or a document over its cap; a section with no text; a relative link that does not resolve; and twelve words repeated across the two documents. The message carries the number: `PRODUCT.md § Behaviour: 512 words, cap 400`.

The check is advisory until the repository is under budget. Then its job name joins the ruleset's required list.

This is the one workflow shared across repositories. The rule that each repository carries its own exists so a change lands once. A checker is the opposite case: two versions make a convention that differs by repository, and the difference is invisible. The checker changes only in a pull request that changes this document.

Rejected:

- **A copy of the script in each repository.** No shared failure, but four copies drift.
- **A test on prose style.** An agent satisfies it by deleting the rule.
- **Headings with no budget.** Cheaper to adopt, and `dispatch` stays at 4,000 words.

## Adoption

One docs-only pull request per repository:

1. This repository and `aivara-se/.template`: this document, the checker, the templates.
2. `dispatch`: 3,974 to 1,200. The pilot.
3. `pereda`: 1,411 to 1,200.
4. `.website`: 1,370 to 1,200, and its missing `SYSTEMS.md`.

The worst file goes first: 69 percent of a wake's reading, and the checker's first red run.

A word that leaves a document moves to an ADR, an issue, a test or `CHANGELOG.md`. It is not deleted.

## What would kill it

A budget so tight that a rule leaves the document. The agent then invents it at the point of use, and the document becomes less true than the free text it replaced.

The cap is a ceiling, not a target. When a section is full and a rule is missing, the author removes an old rule or takes a decision.
