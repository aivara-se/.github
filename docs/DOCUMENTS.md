# Document standard

`PRODUCT.md` and `SYSTEMS.md` are contracts. Each follows a fixed set of headings, in a fixed order, inside a word budget. A heading with nothing to say keeps its place and says `None`.

## Why

Free text mixes statements that live for different lengths of time: the goal, this version's rules, the mechanism, and the history of decisions. An agent cannot tell which sentence limits it, so it obeys a rule that moved, or invents one that was never decided.

The headings name the lifetime of each statement. The budget forces the author to keep the rule that matters.

## One fact, one home

| The question                                  | The document |
| --------------------------------------------- | ------------ |
| Why does this exist, and who is it for?       | `PRODUCT.md` |
| What must hold in this version?               | `PRODUCT.md` |
| How is it shaped, and what does it depend on? | `SYSTEMS.md` |
| Why this way, and what did it cost?           | ADR          |
| What is being built now?                      | issue        |
| Does it work?                                 | test         |

A sentence that answers two questions belongs in one document, and the other links to it. A word that leaves a document moves to an ADR, an issue, a test or a release. It is not deleted.

## PRODUCT.md

The document states the goal and the boundary. An agent reads it to learn what it may change.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Problem` | 120 | The person, the cost, and why now. The last paragraph says what the product is. |
| `## Scope` | 150 | Three lists: `In`, `Not this version`, `Never`. |
| `## Behaviour` | 340 | The rules a person can see. One rule per bullet, 25 words or fewer. |
| `## Autonomy` | 70 | What an agent decides alone, and what needs a decision. |
| `## Vision` | 50 | What this becomes, and what must not change on the way. |
| `## Acceptance` | 70 | At most eight outcomes, each checkable by someone else. |

Total: 800 words.

Rules:

- `## Problem` names the pain, not the feature. Its last paragraph says what the product is, and who uses it and who runs it. If the product is the answer, the question is missing.
- `## Scope` gives each list its lifetime. `In` is this version's work. `Not this version` is deferred and may return. `Never` is refused in every version. An agent reads this one section to learn what it may change.
- `## Behaviour` holds rules, not mechanisms. A rule that needs a mechanism sends the reader to `SYSTEMS.md`.
- `## Autonomy` names what an agent decides alone: anything these two documents do not fix, inside the scope. It names what needs a decision first: a new dependency, a change to the data model, a change to an external interface, or anything `Never` forbids.
- A rule the work needs and the document lacks is written here in the same pull request. The budget decides whether it stays.
- `## Acceptance` is the proof: eight outcomes at most, each checkable by someone else. This list is enough; no other document repeats it.
- The product document says nothing about versions. What shipped, and when, is the releases' record.

## SYSTEMS.md

The system document is the shape of the running thing, in three parts.

| Section | Cap | It holds |
| --- | --- | --- |
| `## Architecture` | 240 | The parts and what each is responsible for, the data they share, and the boundary each exposes. |
| `## Dependencies` | 50 | What it needs and why. One line each. |
| `## Failure modes` | 110 | One line per failure a person can meet, and what happens. |

Total: 400 words.

Rules:

- `## Architecture` stays above the code. A part is a responsibility with a boundary, not a package; the data is the model, not the schema; a boundary states its contract, not its transport.
- "One row per day, keyed by the local date" is data; a column list is implementation.
- No config keys, no DDL, no file-by-file functions, no test, plan or decision.

## Enforcement

`scripts/check-docs.ts` runs from `.github/workflows/docs.yml`, which a repository calls as one job in `validate`.

It fails on a heading that is missing, unknown or out of order; a section or a document over its cap; a section with no text; a relative link that does not resolve; and twelve words repeated across the two documents. The message carries the number: `PRODUCT.md § Behaviour: 412 words, cap 340`.

This is the one workflow shared across repositories. The rule that each repository carries its own exists so a change lands once. A checker is the opposite case: two versions make a convention that differs by repository, and the difference is invisible. The checker changes only in a pull request that changes this document.

Rejected:

- **A copy of the script in each repository.** No shared failure, but the copies drift.
- **A test on prose style.** An agent satisfies it by deleting the rule.
- **Headings with no budget.** Cheaper to adopt, and the long document stays long.

## What would kill it

A budget so tight that a rule leaves the document. The agent then invents it at the point of use, and the document becomes less true than the free text it replaced.

The cap is a ceiling, not a target. When a section is full and a rule is missing, the author removes an old rule or takes a decision.
