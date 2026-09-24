# Code review prompt template

This is the review schema of the `aivara-se` agent convention. A reviewer's report follows it, so that two reviewers who never meet produce comparable verdicts. It is referenced from `AGENTS.md` and from `.agents/skills/review/SKILL.md` on purpose: the file it was ported from (`thani-sh/provar`, `.agents/prompts/code-review.md`) was reachable from nowhere, which is how a review schema dies.

Ported and generalised: the four evaluation pillars and the five-section output framework are provar's; the worked examples, the language specifics and the invocation to "prioritize enterprise software engineering principles" as a slogan are not. Added: a verdict line, and the requirement that every finding carries the evidence that shows it.

---

## Instructions

Review the change, not the repository. Read the task or pull request body first to learn what was claimed and what the acceptance criteria are, then read the diff twice — once for what it does, once for what it does not do. Run the change before judging it.

Prioritise correctness, then maintainability, then style. Do not restate the diff; a summary of what the author already wrote is not a finding. Do not pad with praise; if there is nothing to report, say that plainly.

Language-level style is the language's own tools' business, not this review's: a formatter or linter would already have caught it, and if it did not, that is a finding about the checks rather than about the code.

---

## Core Evaluation Pillars

### 1. Design principles

* **Single responsibility:** identify components that handle more than one concern — business rules mixed with data access, logging, or presentation. Each one should have exactly one reason to change.
* **Open/closed:** look for structures that must be edited every time a new variant appears (long `if`/`switch` chains keyed on a type code), and consider whether the variant should be data or an implementation instead.
* **Substitutability:** an implementation of an interface must honour that interface's contract — no unexpected exceptions, no narrowing of accepted input, no surprising side effects.
* **Interface size:** flag interfaces whose clients must depend on methods they never call. Prefer narrow, role-specific ones.
* **Dependency direction:** high-level policy should depend on abstractions, not on concrete infrastructure. Trace the imports; the arrow that points the wrong way is the finding.

### 2. Duplication and reuse

* Look for copy-pasted blocks, mirrored logic across modules, and the near-copies that differ in one line — they are the ones that drift silently.
* Consolidate without inventing premature coupling: two callers with genuinely different reasons to change are allowed to have similar code.

### 3. Complexity and code hygiene

* **Oversized files and functions:** a unit that needs a table of contents or more arguments than a reader can hold is a unit to split. Name the split, not just the complaint.
* **Nesting and length:** reduce cyclomatic complexity by returning early and extracting small, single-purpose helpers.
* **Dead weight:** commented-out code, unused exports, unreachable branches, TODOs with no owner.

### 4. Tests, safety and documentation

* Does the change come with the tests that fail without it, covering the happy path, the error path and at least one boundary?
* Are error paths explicit — is anything swallowed, defaulted, or caught and ignored where it should fail?
* Does anything new touch secrets, credentials, personal data, or a network boundary it did not touch before?
* Is the documentation that the change invalidates updated in the same change? Is the repository map in `AGENTS.md` still true?
* Is the change the one the task asked for, or does it contain unrelated work?

---

## Output Framework

Produce the review in this order, with this structure. Keep it as long as the findings require and no longer.

### 0. Verdict

One line, first line, exactly one of:

* `approve` — the change was run and nothing must change before it lands.
* `request changes` — followed by the count of required changes.
* `block` — the decision is not the reviewer's (missing access, a product decision, an external service).

Then, in one sentence, what was run to reach the verdict — the command and the branch or commit it ran against.

### 1. Executive summary and code health audit

* What the change does, in the reviewer's words, and whether that matches what the body claimed.
* The systemic risks in it: the one or two things that would matter six months from now.

### 2. Findings

For each finding, in this format, most severe first:

* **Location:** file and line (or the smallest unit that identifies it).
* **The violation:** the principle, stated in the vocabulary of the pillars above.
* **The problem and impact:** how this degrades correctness, testability, or maintenance cost — concretely, not in general.
* **The evidence:** the command, the input, or the test output that shows it. A finding without evidence is an opinion, and opinions are not actionable.

Separate **must fix before this lands** from **worth doing later**. A review that cannot tell the two apart blocks work for no reason.

### 3. Target design

The shape the change should have instead: what moves where, what the boundary is, and which of the pillars it satisfies. One screen, not a redesign of the repository.

### 4. Phased plan

Only when changes are required, and only for the requested changes: a low-risk-first sequence, so the author can land the safe part without waiting on the decision in the risky part.

### 5. Blueprint

Only when a concrete transformation makes the finding clearer than prose does. Contrast the current shape with the intended one, in the repository's own language and idioms, over the smallest excerpt that shows it.
