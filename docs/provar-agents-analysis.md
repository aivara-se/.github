# provar agent configuration — analysis for the aivara-se template

**Task:** kanban `t_65b4f6c7` — analyze `thani-sh/provar`'s agent configuration into a written spec
so it can be generalized for the `aivara-se` organization.
**Source:** `thani-sh/provar` at commit `9ab8fe88391702cb678d18feef2e51d76852b880` (2026-09-19 00:42:23 +0530), obtained with
`git clone --depth 1 https://github.com/thani-sh/provar`.
**Citation convention:** every claim cites the file it came from as `<path>#L<start>-L<end>`; line
numbers refer to that clone. Front matter of every file quoted below is reproduced verbatim from
disk, not retyped by hand.

## 0. Scope: the entire agent-config surface is seven files

The whole of provar's agent configuration is committed as ordinary repo files — there is no
generated config, no tool-specific manifest, no `CLAUDE.md`, and no `.cursor/` or similar. Outside
`.git`, the config surface is:

| Path | Bytes | Lines | SHA-256 (first 12) | Role |
|---|---|---|---|---|
| `AGENTS.md` | 1928 | 42 | `e4e1ad1b8291` | Root entry point: focus, tooling, VCS policy, repo map, skill index |
| `.agents/skills/coding/SKILL.md` | 2778 | 34 | `87284b8e7535` | Go coding standards + pre-completion verification |
| `.agents/skills/testing/SKILL.md` | 987 | 30 | `ae035b07b994` | How to write and run Go tests |
| `.agents/skills/writing/SKILL.md` | 1143 | 19 | `f176c11c8193` | Documentation rules + README expectations |
| `.agents/skills/writing/resources/readme-app-template.md` | 239 | 7 | `f6a9e021e69f` | Scaffold for an `apps/` README |
| `.agents/skills/writing/resources/readme-lib-template.md` | 600 | 19 | `61448e45f46d` | Scaffold for a `libs/` README |
| `.agents/prompts/code-review.md` | 4675 | 61 | `f64fddc637d8` | Standalone code-review prompt template (see §4) |

Two further files carry commands that the agent config depends on but does not own:
`package.json` (scripts) and `.github/workflows/checks.yml` (CI). Both are covered in §6.

## 1. `AGENTS.md` — verbatim, section by section

`AGENTS.md` is 42 lines: one `#` title, six `##` sections, and one unlabelled status
line under the title. The sections appear in this order:

| # | Heading | Lines | What it does |
|---|---|---|---|
| 1 | `# Agent Instructions` | `AGENTS.md#L1-L4` | Document title, plus one unlabelled line that orients the agent on what the project is and what its non-negotiables are. There is no "how to use this file" preamble, no table of contents, and no audience statement — it assumes the reader is an agent about to start work on the repo. |
| 2 | `## Current Project Focus` | `AGENTS.md#L5-L8` | Pins the work of the moment: polish UX, touch the shared libraries only lightly, do not change the domain model. Time-bound steering that a human would otherwise have to say in chat every time. |
| 3 | `## Clarifying Requirements` | `AGENTS.md#L9-L12` | Makes "ask before you build" an explicit rule, and names the engineering values to appeal to (YAGNI, DRY, SOLID) so the agent argues for maintainability rather than feature volume. |
| 4 | `## Tooling & Verification` | `AGENTS.md#L13-L17` | The command section. Two bullets, one per language, each naming the exact commands, and each written with a hard ALWAYS. Note there is no build/lint/test matrix here — the tests live in the testing skill and the wrapper in the root package.json. |
| 5 | `## Version Control` | `AGENTS.md#L18-L24` | Three bullets covering cleanup, branch naming and commit rules. This is where a conventional-commit and linear-history policy lives. Note "Never commit without explicit user approval", the only human-in-the-loop gate in the file. |
| 6 | `## Monorepo Structure` | `AGENTS.md#L25-L35` | A four-line map of the tree plus a routing rule for where new markdown goes. It is a pointer map, not a description: each doc is one filename and one phrase. |
| 7 | `## Agent Skills` | `AGENTS.md#L36-L42` | The last section, and the only place skills appear. It is a bare list of three relative paths, preceded by one sentence naming what they cover. No skill names, no descriptions, no "when to read this" criteria, and no instruction to read them — the phrase is "refer to". |

Everything below is reproduced verbatim from the clone.

### `AGENTS.md#L1-L4` — `# Agent Instructions`

```
# Agent Instructions

Project status: Provar is a developer tool built in Go and Typescript, designed with a focus on simplicity, minimal dependencies, and strict resistance to code bloat.

```

### `AGENTS.md#L5-L8` — `## Current Project Focus`

```
## Current Project Focus

The primary focus is refining and polishing the user experience (UX). Development work should concentrate on UX interactions while making only minor improvements to shared libraries. The domain model must be strictly followed and should not be modified.

```

### `AGENTS.md#L9-L12` — `## Clarifying Requirements`

```
## Clarifying Requirements

Before writing code, interview the user to clearly understand the intention. Discuss available alternatives and prioritize long term code maintainability and software best practices (YAGNI, DRY, SOLID, etc.).

```

### `AGENTS.md#L13-L17` — `## Tooling & Verification`

```
## Tooling & Verification

- **Go Code**: ALWAYS Use standard Go commands. Always run `go fmt ./...` and `go vet ./...` to verify code.
- **TS Code**: ALWAYS use Bun (`bun install`, `bun run`) for dependency management inside `apps/provar-web`

```

### `AGENTS.md#L18-L24` — `## Version Control`

```
## Version Control

- **Cleanup**: After verification, rebase and merge to `main`, and clean up any worktrees/temporary files.
- **Branches**: Lowercase with hyphens only, no prefixes, no uppercase letters, e.g., `feature-name`.
- **Commits**: Never commit without explicit user approval. Never make merge commits (keep history linear).
  - Follow Conventional Commits: lowercase only, no scopes, no extra lines, e.g., `type: short description`.

```

### `AGENTS.md#L25-L35` — `## Monorepo Structure`

```
## Monorepo Structure

- `apps/`: User applications
- `libs/`: Reusable packages
- `docs/`: Product documentation
  - `docs/DESIGN.md`: Design system (UI/UX)
  - `docs/PRODUCT.md`: Product specification
  - `docs/SYSTEM.md`: Systems architecture

When adding markdown documentation, consult the structure above first.

```

### `AGENTS.md#L36-L42` — `## Agent Skills`

```
## Agent Skills

For detailed guidelines on development, testing, and writing, refer to the agent skills:

- .agents/skills/coding/SKILL.md
- .agents/skills/testing/SKILL.md
- .agents/skills/writing/SKILL.md
```

## 2. The `.agents` tree

There is no `.agents/README.md`, no config file, and no index. Everything is discovered either from
the list at the end of `AGENTS.md` or by walking the directory. The tree is two levels deep plus one
`resources/` directory:

```
.agents
  prompts
    code-review.md
  skills
    coding
      SKILL.md
    testing
      SKILL.md
    writing
      SKILL.md
      resources
        readme-app-template.md
        readme-lib-template.md
```

Layout conventions this implies (`AGENTS.md#L36-L42`, `.agents/skills/testing/SKILL.md#L8`):

- Skills live at `.agents/skills/<name>/SKILL.md` — one directory per skill, the file always named
  `SKILL.md` with that exact capitalisation, `<name>` lowercase and single-word.
- Extra material a skill needs goes in a `resources/` subdirectory of that skill
  (`.agents/skills/writing/resources/`). There is no `scripts/` or `references/` sibling.
- A second category, `.agents/prompts/`, holds standalone prompt templates. It has exactly one
  member and is not mentioned anywhere in `AGENTS.md`.
- Skill directories are flat: there is no grouping by language or by phase.

## 3. Every skill, with purpose and contents

All three skills use the same minimal YAML front matter: exactly two keys, `name` and `description`.
There is no `when-to-use`, no `allowed-tools`, no `paths`, no `version`, no `license`. The body is
always `# <Title>` followed by `##` sections; no skill has a `## When to use` section, so the trigger
condition lives in the `description` front matter and in prose lines inside the body.

| Skill | File | `name` | `description` (verbatim) | Supporting files |
|---|---|---|---|---|
| `coding` | `.agents/skills/coding/SKILL.md` | `coding` | Coding guidelines, Go conventions, styling, and code quality expectations. | — (none) |
| `testing` | `.agents/skills/testing/SKILL.md` | `testing` | Guidelines for compiling, running, and writing Go unit and integration tests. | — (none) |
| `writing` | `.agents/skills/writing/SKILL.md` | `writing` | Guidelines for maintaining clean, high-quality, and non-bloated documentation. | `.agents/skills/writing/resources/readme-app-template.md`, `.agents/skills/writing/resources/readme-lib-template.md` |

### 3.1 `coding` — `.agents/skills/coding/SKILL.md`

- **Purpose.** Go coding standards: anti-bloat rules, naming/style, error handling, exports policy, and the three verification commands to run before calling a task done.
- **Trigger.** Work touching Go source anywhere in the monorepo. `AGENTS.md#L40` names it as the guide for "development"; the skill itself states no trigger of its own — there is no "use when" line.
- **Required tools / paths.** Go toolchain: `go fmt ./...`, `go vet ./...`, `golangci-lint run` when available; a compiler ("verify that the application compiles"). Needs a human: "ALWAYS ask the user for approval before adding or modifying any public exports" (`.agents/skills/coding/SKILL.md#L27`).
- **Assumed file layout.** Refers to `docs/SYSTEMS.md` for the library-responsibility map (`.agents/skills/coding/SKILL.md#L16`). Assumes package-level constants/vars at the top of each file.
- **Layout conventions.** Assumes the Go workspace layout of the repo root (`go.mod` at the root, packages under `apps/` and `libs/`).
- **Sections.** `# Go Coding Standards Guide`, `## Code Quality & Anti-Bloat`, `## Naming & Style`, `## Pre-Completion Verification`

Verbatim front matter:

```
---
name: coding
description: Coding guidelines, Go conventions, styling, and code quality expectations.
---
```

Verbatim body:

```

# Go Coding Standards Guide

Provar is written in Go with a focus on simplicity, readability, and avoiding bloat. Adhere strictly to these coding standards.

## Code Quality & Anti-Bloat

- **Minimal Dependencies**: Do not add external packages unless absolutely necessary. Rely on the Go standard library first.
- **Idiomatic Go**: Use idiomatic Go structures. Handle errors explicitly. Never use `panic` or recover unless a panic is truly unrecoverable.
- **Zero Redundancy**: Avoid unnecessary allocations, deep nested blocks, and redundant logic. Keep functions short and single-purpose.
- **Strict Types**: Avoid using `any` or `interface{}` unless designing generic wrappers or interface boundaries where dynamic type inspection is required.
- **Respect Library Responsibilities**: Adhere strictly to the defined purpose and boundary of each library/sub-package in the workspace (refer to `docs/SYSTEMS.md` for definitions). Never blur architectural concerns or introduce circular dependencies between these components.

## Naming & Style

- **Conventions**: Use standard Go naming (camelCase for variables/functions, PascalCase for types/structs/exported items).
- **Return Early**: Encourage a "return early" approach to reduce code nesting depth.
- **Function Body Layout**: Strictly avoid empty lines inside any function body.
- **Function Comments**: Add comments inside function bodies only when absolutely necessary (e.g., `TODO` and `FIXME` comments are allowed exceptions).
- **Constants & Magic Values**: Strictly avoid magic strings or numbers inside function bodies. Declare them at the top of the file as constants (or package-level variables if non-constant).
- **Error Handling vs Defaults**: Avoid using default fallback values whenever possible (e.g., default model names) or falling back to environment variables for API keys/credentials. Instead, return an error (fail explicitly) if a required parameter is missing or invalid.
- **Exported Symbols & Public API**: Every exported function, type, and struct must have a doc comment that begins with the name of the symbol (e.g., `// Execute runs the test compiler...`).
- **Minimize Exports**: Pay great attention to public symbols (exported structs, fields, methods, functions, etc.). To prevent public API bloat, keep as much as possible package-private. **ALWAYS** ask the user for approval before adding or modifying any public exports.

## Pre-Completion Verification

Before completing any task:
1. **Formatting**: Run `go fmt ./...`.
2. **Linting & Safety**: Run `go vet ./...` (and `golangci-lint run` if available).
3. **Build**: Verify that the application compiles without warnings.
```

### 3.2 `testing` — `.agents/skills/testing/SKILL.md`

- **Purpose.** How to write and run tests: file placement, table-driven style, mocking, edge-case expectations.
- **Trigger.** Any feature, package or bug fix — the skill opens by asserting coverage is mandatory (`.agents/skills/testing/SKILL.md#L8`). No explicit "when to use" line.
- **Required tools / paths.** `go test ./...`, `go test ./libs/engine`, `go test -v -run <Name> ./path`. Only the standard `testing` package; mocking external network and filesystem instead of hitting them.
- **Assumed file layout.** Test files sit next to the code as `*_test.go` (`.agents/skills/testing/SKILL.md#L12`); examples use `./libs/engine`.
- **Layout conventions.** Assumes package-local `_test.go` files; no separate `test/` tree, no build tags mentioned (CI documentation notes integration suites need `-tags integration`, `.github/workflows/checks.yml#L37-L41`).
- **Sections.** `# Testing & Verification Guide`, `## Writing Tests`, `## Running Tests`

Verbatim front matter:

```
---
name: testing
description: Guidelines for compiling, running, and writing Go unit and integration tests.
---
```

Verbatim body:

````

# Testing & Verification Guide

Every feature, package, and bug fix must be covered by robust Go unit or integration tests.

## Writing Tests

- **Test Files**: Place test files next to the code they verify, naming them `*_test.go`.
- **Idiomatic Testing**: Use Go's standard `testing` package. Prefer table-driven tests for testing multiple input/output scenarios.
- **Mocking & Isolation**: Mock external network or filesystem interactions to ensure tests run fast and locally without side effects.
- **Edge Cases**: Ensure test coverage checks happy paths, validation errors, and boundary/edge cases.

## Running Tests

- Run all tests in the workspace:
  ```bash
  go test ./...
  ```
- Run tests in a specific package:
  ```bash
  go test ./libs/engine
  ```
- Run a specific test with verbose output:
  ```bash
  go test -v -run TestCompileEngine ./libs/engine
  ```
````

### 3.3 `writing` — `.agents/skills/writing/SKILL.md`

- **Purpose.** Documentation rules: no stack bloat, single source of truth per document, no soft wraps, and a README expectation per app and per library.
- **Trigger.** Any documentation or README work (`.agents/skills/writing/SKILL.md#L8`), and — via `AGENTS.md#L34` — deciding where new markdown goes at all.
- **Required tools / paths.** None; pure prose rules.
- **Assumed file layout.** `docs/PRODUCT.md` (user-facing spec), `docs/SYSTEMS.md` (technical design), `apps/*/README.md`, `libs/*/README.md`. Its own `resources/readme-app-template.md` and `resources/readme-lib-template.md` are **not** referenced from the skill body — they are found only by listing the directory.
- **Layout conventions.** Assumes `docs/` holds the two specification files and that every `apps/` and `libs/` entry owns a README.
- **Sections.** `# Writing & Documentation Guide`, `## General Guidelines`, `## README Templates`

Verbatim front matter:

```
---
name: writing
description: Guidelines for maintaining clean, high-quality, and non-bloated documentation.
---
```

Verbatim body:

```

# Writing & Documentation Guide

Provar documents must remain concise, accurate, and free of bloat.

## General Guidelines

- **No Technology Stack Bloat**: Do not include generic lists of technologies used (e.g., "built with Svelte/Vite/Bun"). Keep descriptions focused entirely on the project's purpose, features, and target user value.
- **Single Source of Truth**: User-facing specifications go into `docs/PRODUCT.md`. Technical design/architecture details go into `docs/SYSTEMS.md`. Do not duplicate information between them.
- **Conciseness**: Keep paragraphs short. Do not use soft line wraps (line breaks within paragraphs). Let paragraph text exist on a single line so it wraps naturally in viewers.

## README Templates

- **Applications**: Every application in the `apps/` directory should have a concise `README.md` at its root outlining setup and development instructions.
- **Shared Libraries**: Every package in the `libs/` directory should have a brief `README.md` explaining the package API and standard usage.
```

Its two supporting files are scaffolds, reproduced verbatim.

`resources/readme-app-template.md`:

```
# [Application Name]

[Provide a concise description of the application, its primary user-facing features, and its goals.]

## Quick Start

[Provide steps to get the application up and running locally. Keep it concise and easy to follow.]
```

`resources/readme-lib-template.md`:

````
# [Library Name]

[Provide a concise one- or two-sentence description of what this shared library does, its purpose, and who it's for.]

## Key Features

- **[Feature 1]:** [Brief description of feature 1.]
- **[Feature 2]:** [Brief description of feature 2.]
- **[Feature 3]:** [Brief description of feature 3.]

## Usage

[Provide brief, clear TypeScript usage examples showing how to import and use the library's primary exports. Add examples for all public exports and their common use cases.]

```typescript
import { someExport } from '[library-package-name]';

const result = someExport();
```
````

## 4. `.agents/prompts/code-review.md`

A standalone prompt template, not a skill: no front matter, plain `#`/`##` markdown, 61 lines.
It tells a reviewing agent to analyze a codebase for architectural flaws and produce a phased
refactoring strategy. Its structure (`.agents/prompts/code-review.md#L11-L61`):

- **Instructions** (`#L11-L15`): analyze, then design a low-risk refactoring strategy; "prioritize
  enterprise software engineering principles over quick fixes".
- **Core Evaluation Pillars** (`#L17-L48`): SOLID (each principle given its own bolded bullet),
  DRY/deduplication, structural complexity and code hygiene (oversized files, deep nesting), and
  design patterns / scalability.
- **Output Framework** (`#L50-L61`): a fixed five-part answer — executive summary and code-health
  audit; technical debt breakdown in a fixed `Location / The Violation / The Problem & Impact`
  format; target architecture and pattern mapping; a three-phase refactoring action plan
  (deconstruction → architectural realignment → consolidation); and before/after code blueprints.

Two things matter for adaptation. First, this is the only review artifact in the repo, and
`AGENTS.md` never mentions it — nothing links a "review" step to this prompt, so an agent finds it
only by listing `.agents/prompts/`. Second, it encodes a *fixed output schema* for reviews, which is
the most transferable idea in the whole config: it is what makes two different reviewers comparable.

Verbatim (`.agents/prompts/code-review.md#L1-L61`):

```
# Code Review Prompt Template

This prompt template guides a code review focusing on structural design, SOLID principles, technical debt, and refactoring strategy.

---

## Instructions

Analyze the provided codebase to identify architectural flaws, technical debt, and violations of clean coding practices, then design a structured, low-risk refactoring strategy. Prioritize enterprise software engineering principles over quick fixes. Focus on transforming rigid, tightly coupled, and bloated implementations into highly modular, testable, and scalable systems using standard design patterns and clean code metrics.

---

## Core Evaluation Pillars

### 1. SOLID Principles
*   **Single Responsibility Principle (SRP):** Identify classes, modules, or functions handling multiple concerns (e.g., mixing business rules, data access, logging, or UI logic). Ensure each component has exactly one reason to change.
*   **Open/Closed Principle (OCP):** Detect rigid structures, such as extensive `if-else` or `switch` chains driven by type codes, that require modification whenever a new variant is introduced. Target these for replacement via polymorphism or behavioral design patterns.
*   **Liskov Substitution Principle (LSP):** Ensure derived classes or interface implementations honor the contract of their abstractions without throwing unexpected exceptions or altering expected behaviors.
*   **Interface Segregation Principle (ISP):** Spot bloated, multi-purpose interfaces that force client implementations to depend on methods they do not use. Advocate for lean, role-specific interfaces.
*   **Dependency Inversion Principle (DIP):** Trace dependency directions. Ensure high-level business policies depend on stable abstractions rather than concrete execution details or specific infrastructure components.

### 2. DRY (Don't Repeat Yourself) & Deduplication
*   Isolate copy-pasted blocks, structural redundancies, and mirrored logic across separate modules.
*   Design reusable abstractions, utility wrappers, or base classes to consolidate identical behaviors without introducing artificial or premature coupling.

### 3. Structural Complexity & Code Hygiene
*   **Bloated Modules / Large Files:** Target files exceeding acceptable line-count thresholds. Outline a physical file-splitting strategy to isolate independent domain sub-units.
*   **Deep Nested / Long Functions:** Diagnose methods with high cyclomatic complexity or excessive vertical length. Break them down into small, self-documenting, and single-purpose helper functions.

### 4. Design Patterns & Scalability
*   Introduce proven structural, creational, and behavioral design patterns (e.g., **Factory, Strategy, Observer, Facade, Dependency Injection**) to decouple subsystems and streamline execution paths.

---

## Output Framework

Produce a structured review response covering the following five sections:

### 1. Executive Summary & Code Health Audit
*   A concise, high-level diagnosis of the architectural landscape.
*   Identification of the primary bottlenecks, critical anti-patterns, and systemic risks found in the provided code.

### 2. Technical Debt & Violations Breakdown
For each distinct issue identified, provide a granular breakdown using this format:
*   **Location:** Specific file, class, method, or structural context.
*   **The Violation:** The exact engineering principle violated (e.g., SRP, DRY, Code Bloat).
*   **The Problem & Impact:** Technical explanation of how the current code degrades testability, increases maintenance overhead, or introduces regression risks.

### 3. Target Architecture & Pattern Mapping
*   A blueprint of the proposed state.
*   Explicit justification for each design pattern introduced, detailing exactly how it simplifies execution flow or isolates volatile logic.

### 4. Phased Refactoring Action Plan
A sequential, risk-mitigated execution strategy designed to prevent breaking changes:
*   **Phase 1: Deconstruction (Low Risk):** Splitting oversized files and decomposing long, nested functions into pure helper methods without altering core behavior.
*   **Phase 2: Architectural Realignment (Medium Risk):** Decoupling modules, applying SOLID boundaries, and introducing structural/behavioral design patterns.
*   **Phase 3: Consolidation & Polish (Low Risk):** Merging duplicated logic via DRY principles and running final verification sweeps.

### 5. Code Blueprints (Before vs. After)
*   Provide a side-by-side or sequential code transformation showing a high-impact section of the codebase.
*   The blueprint must clearly contrast the original anti-pattern with the clean, refactored, and highly optimized implementation.
```

## 5. Structural conventions of `AGENTS.md`

**Section order.** Title and one orienting status line, then: *current focus → how to clarify
requirements → tooling and verification → version control → repo structure → skill index*
(`AGENTS.md#L1-L42`). The order is deliberate and worth keeping:

1. It opens with *what the project is and what to protect*, so the agent has a frame before any
   instruction.
2. **Current focus** (§2) comes before the standing rules, so temporary steering outranks permanent
   guidance in reading order.
3. **Clarifying requirements** (§3) sits before the concrete rules, so "ask first" is read as a
   precondition for the commands that follow.
4. Commands (**tooling**) and process (**version control**) come after the human-interaction rules
   and before the map.
5. It *ends* on the skill index — the file's final act is to point outward, which works because a
   reader reaches the bottom having already been told what to do.

**Tone.** Imperative, second person, no padding. Bullets are verb-led or noun-led; there is no
narrative, no history, and no rationale paragraphs — a rule appears with its command and nothing
else. Emphasis is carried by capitalised modals: `ALWAYS` twice in the same bullet pair
(`AGENTS.md#L15-L16`), `Never` twice under version control (`AGENTS.md#L22-L23`), and in the skills
`ALWAYS`/`Strictly`/`Never` (`.agents/skills/coding/SKILL.md#L27`, `#L12-L14`). Rules that admit no
judgement are marked as such; nothing is hedged with "consider" or "prefer".

**How it references skills.** One sentence, then a bare bullet list of relative paths
(`AGENTS.md#L36-L42`): `- .agents/skills/coding/SKILL.md`. No skill names, no one-line summaries,
no "read this before X", and no numbering. The `description` in each skill's front matter is the
only human-readable summary of a skill, and `AGENTS.md` does not surface it. This is the weakest
part of the convention: adding a fourth skill means editing this list by hand, and a stale entry
costs nothing at commit time.

**How it encodes build / test / lint commands.** Three layers, each with a different owner:

| Layer | File | What it says |
|---|---|---|
| Direct commands, per language | `AGENTS.md#L15-L16` | `go fmt ./...`, `go vet ./...`; Bun (`bun install`, `bun run`) inside `apps/provar-web` |
| Full test guidance | `.agents/skills/testing/SKILL.md#L17-L30` | the same `go test` variants, with examples |
| The wrapper everything actually runs | `package.json#L16-L29` | `npm run all` = `fmt && vet && test && build`; plus `build:cli`, `build:api`, `tidy`, `clean` |
| The gate | `.github/workflows/checks.yml#L42-L43` | CI calls `npm run all` deliberately "so the workflow runs the same commands a developer runs" |

The pattern to copy is the *single wrapper* (`npm run all`) that the human, the agent, and CI all
invoke, with the CI file carrying a comment explaining why it delegates rather than re-listing
steps. The pattern to fix is that `AGENTS.md` restates the commands instead of pointing at the
wrapper, so there are two places to update.

**Cross-reference from the human entry point.** `README.md#L82` restates the branch/commit policy in
one sentence and links `AGENTS.md` ("holds the full conventions") plus `.agents/skills`. So the repo
has one canonical copy of the rules and a pointer to it from the file a human actually opens first.
The relationship is one-directional: `AGENTS.md` never links back to `README.md`.

**Agent-role and handoff conventions.** There are none. `AGENTS.md` never names a role, never
describes a handoff, never mentions review, and never says who approves what. The only two
human-in-the-loop rules are "Never commit without explicit user approval" (`AGENTS.md#L22`) and
"ALWAYS ask the user for approval before adding or modifying any public exports"
(`.agents/skills/coding/SKILL.md#L27`). So the multi-agent role/handoff layer of the aivara-se
convention has no precedent here to inherit — it has to be designed new.

## 6. What to generalize, what to drop

### 6.1 Generalize (the transferable core)

| Convention | Source | Why it generalizes |
|---|---|---|
| Root `AGENTS.md` as the single entry point | `AGENTS.md` | Tool-neutral filename at a predictable path, with no vendor-specific manifest required |
| The section order: status → focus → clarify → commands → VCS → structure → skills | `AGENTS.md#L1-L42` | Works for any repo; the ordering rationale in §5 is language-independent |
| Declaring the *current focus* in the config file | `AGENTS.md#L5-L8` | Turns recurring chat instructions into a durable, reviewable statement |
| "Interview the user before writing code" | `AGENTS.md#L9-L11` | Directly reusable; it is the cheapest guard against wrong-direction work |
| Naming the engineering values to appeal to (YAGNI/DRY/SOLID) | `AGENTS.md#L11` | Gives an agent a shared vocabulary for arguing against scope |
| Per-language command bullets, with `ALWAYS` | `AGENTS.md#L13-L16` | The shape transfers; the languages do not |
| Branch naming + Conventional Commits + linear history + no commit without approval | `AGENTS.md#L18-L23` | Org-wide policy material, not repo-specific |
| A repo map with an explicit "where does new markdown go" rule | `AGENTS.md#L25-L34` | Every repo has a structure; the rule prevents docs sprawl |
| `.agents/skills/<name>/SKILL.md` with `name` + `description` front matter | all three `SKILL.md`s | Minimal, tool-agnostic, and the `description` is what makes a skill discoverable |
| Splitting by concern rather than by language/phase (coding / testing / writing) | `.agents/skills/` | Concern-based skills apply across a polyglot repo |
| `resources/` next to a `SKILL.md` for templates it needs | `.agents/skills/writing/resources/` | Simple, no registry required |
| A fixed review-output schema | `.agents/prompts/code-review.md#L50-L61` | Makes reviews from different agents comparable; the specific five sections are a reasonable default |
| One all-in-one check command that humans, agents and CI all run | `package.json#L16-L17`, `.github/workflows/checks.yml#L42-L43` | Removes command drift between config, docs and CI |
| Skills carrying their own verification checklist | `.agents/skills/coding/SKILL.md#L29-L34` | "Pre-Completion Verification" is a reusable shape for any skill |
| Instruction to keep commits free of merge commits | `AGENTS.md#L22` | Keeps agent-authored history reviewable |

### 6.2 Drop (provar-specific)

| Detail | Source | Why it must not be copied |
|---|---|---|
| `Provar is a developer tool built in Go and Typescript` and all product prose | `AGENTS.md#L3-L7` | Project identity; the aivara-se template needs a slot, not the words |
| "The domain model must be strictly followed and should not be modified" | `AGENTS.md#L7` | Domain-specific freeze rule |
| Go-specific rules: standard-library-first, `panic` policy, `any`/`interface{}` avoidance, camelCase/PascalCase, doc comments starting with the symbol name | `.agents/skills/coding/SKILL.md#L10-L27` | Language-specific; belongs in a Go profile of the skill, not the shared one |
| "Strictly avoid empty lines inside any function body"; constants at the top of the file; no magic values | `.agents/skills/coding/SKILL.md#L22-L24` | House style of one codebase, and the empty-line rule is idiosyncratic (it does not match `gofmt` output norms) |
| The literal commands `go fmt ./...`, `go vet ./...`, `go test ./...`, `golangci-lint run` | `AGENTS.md#L15`, `.agents/skills/testing/SKILL.md#L17-L30` | Replace with `{{REPO_CHECK_COMMAND}}`-style slots |
| "Use Bun … inside `apps/provar-web`" | `AGENTS.md#L16` | Names a specific app path; also only partially true of the repo (see §6.3) |
| The monorepo map (`apps/`, `libs/`, `docs/DESIGN.md`, `docs/PRODUCT.md`, `docs/SYSTEM.md`) | `AGENTS.md#L25-L34` | provar's layout — and its `docs/SYSTEM.md` spelling is wrong (see §6.3.4) |
| README templates' content (`[Application Name]`, a TypeScript import example) | `.agents/skills/writing/resources/*` | Tied to a Go + TS workspace; keep the *idea* of a template, rewrite the body |
| "Do not include generic lists of technologies used (e.g. "built with Svelte/Vite/Bun")" | `.agents/skills/writing/SKILL.md#L12` | The rule is fine; the examples are provar's stack. Keep the rule, drop the example, or keep it generic |
| References to `docs/SYSTEMS.md` as the architecture authority | `.agents/skills/coding/SKILL.md#L16` | provar filename; must become a documented per-repo convention |
| `.agents/skills` listing only Go/TS concerns, with no "how to run the repo" or "how to ship a PR" skill | `.agents/skills/` | provar has no PR/review skill at all; aivara-se needs one |

### 6.3 Inconsistencies in provar worth *not* inheriting

Three genuine defects found while reading the config, plus one stale detail; each is cited so it can
be verified.

1. **Two package managers, one instruction.** `AGENTS.md#L16` says TS work must use Bun, while
   `package.json#L6` declares `"packageManager": "npm@11.17.0"` and CI runs `npm run all`
   (`.github/workflows/checks.yml#L43`). Bun is used only for `apps/provar-web`
   (`.github/workflows/checks.yml#L55-L78`, which installs with `bun install --frozen-lockfile`).
   A template should state the package manager once, per workspace, and derive everything from it.
2. **A skill's resources are unreachable from the skill.** `.agents/skills/writing/SKILL.md#L16-L19`
   tells the reader that apps and libs need READMEs but never names
   `resources/readme-app-template.md` or `resources/readme-lib-template.md`. Adopting repos would
   likely keep the templates but never use them.
3. **A CI job is disabled by a code comment.** `.github/workflows/checks.yml#L80-L84` explains that
   the desktop app's frontend is excluded from checks because it reports seven pre-existing type
   errors. Reasonable as a temporary note, but it means the "everything is gated" claim in the
   config is not currently true; a shared convention should not ship with a caveat like this.
4. **One filename in the repo map does not exist.** `AGENTS.md#L32` lists `docs/SYSTEM.md`, but the
   tree contains `docs/SYSTEMS.md` (and no `SYSTEM.md`); every other reference — `README.md#L55`,
   `README.md#L74`, `.agents/skills/coding/SKILL.md#L16`, `.agents/skills/writing/SKILL.md#L13` —
   uses the plural. The same map also omits `docs/ROADMAP.md`, `docs/TODOS.md` and `docs/adrs/`,
   which are all tracked in the repo, while the writing skill claims `docs/` is the home of exactly
   two specifications. A map that is wrong about paths is worse than no map, so the aivara-se
   template should state which file is authoritative for architecture and keep the map generated or
   checked.

## 7. Gaps the aivara-se template has to fill

None of these exist anywhere in provar's config; each is a decision the generalization must make
explicitly rather than inherit.

| Gap | Evidence | Consequence for aivara-se |
|---|---|---|
| No agent roles or identities | Absent from all of `AGENTS.md#L1-L42`; only "the user" is addressed (`AGENTS.md#L11`, `#L22`) | The multi-agent model (orchestrator / builder / reviewer) must be written from scratch |
| No handoff or review protocol | The only review artifact, `.agents/prompts/code-review.md`, is unreferenced by `AGENTS.md` | Must define when a review happens, who performs it, and what a reviewer returns |
| No "when to use this skill" field | Front matter of all three `SKILL.md`s is `name` + `description` only | Discovery relies on the reader's judgement; add a `when-to-use` key alongside them, as the design task requires |
| No skill index or registry | `AGENTS.md#L38-L42` is a hand-maintained path list | Needs either a generated index or a rule that the list is updated with each skill |
| No per-repo override mechanism | Commands are hardcoded in `AGENTS.md#L15-L16` and `.agents/skills/testing/SKILL.md#L17-L30` | Adoption across repos with different toolchains requires placeholders or a per-repo override file |
| No versioning or compatibility statement | No `version` key in any front matter; no changelog for the config | An org-wide convention is copied into N repos; without a version marker, drift is invisible |
| Skills are not categorised | `.agents/skills/` is flat (`coding`, `testing`, `writing`) | At three skills flat is fine; the template should state the threshold for introducing grouping |
| No language slots for a non-Go repo | Every command and rule in the three skills is Go (`.agents/skills/coding/SKILL.md#L6-L34`) | The coding/testing skills must become language-parameterised or be split per language |
| No instruction on what an agent may do to the repo unasked | Nearest rules: no commit without approval (`AGENTS.md#L22`), ask before public exports (`.agents/skills/coding/SKILL.md#L27`) | aivara-se's agents push branches and open PRs autonomously; that autonomy needs a written policy, and provar offers none |

## 8. What this means for the aivara-se template

Five concrete implications, in priority order, for the design task that consumes this document:

1. **Keep the `AGENTS.md` shape, extend the section list.** The six `##` sections of provar's
   `AGENTS.md` (§1, rows 2-7) can be adopted almost verbatim as a template with slots; append the
   missing sections — agent roles and the handoff/review protocol — because nothing in provar covers
   them (§5, §7).
2. **Abstract every command into named slots.** One wrapper command per repo (`{{REPO_CHECK_COMMAND}}`
   and friends), documented once and referenced from `AGENTS.md`, CI, and the skills, so the three
   layers cannot drift the way provar's do (§5, §6.3.1).
3. **Add `when-to-use` to the front matter and keep it the only hard requirement.** Two keys is too
   few for discovery at N repos; many keys is not worth the tooling. `name` + `description` +
   `when-to-use` is the smallest set that makes a skill findable without reading it (§3, §7).
4. **Ship a review schema, not a review style.** provar's most reusable invention is the fixed
   five-section review output (`.agents/prompts/code-review.md#L50-L61`); pair it with the
   handoff convention so reviewers who never meet still produce comparable verdicts (§4).
5. **Version the convention and make it referencable.** A repo that adopts the template should be
   able to say which revision it took, so a later org-wide change can be rolled out deliberately
   instead of by re-copying files (§7).
