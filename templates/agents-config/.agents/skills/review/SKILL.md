---
name: review
description: How to review another agent's change, and what the verdict must contain.
when-to-use: A pull request or a task handoff is waiting on your review. Never for your own work — the author of a branch never reviews it.
---

# Review

## Do this, in order

1. Read the task or pull request body: what was claimed, and what the acceptance criteria are. The claim and the task are not always the same thing, and the difference is a finding.
2. Read the diff twice — once for what it does, once for what it does **not** do: the caller nobody updated, the test that would have caught it, the document it just made untrue, the error path that swallows.
3. Run it. Check out the branch, run `commands.check` from `.agents/config.yml`, and exercise the thing the change claims to fix. A reviewer who did not run the change is reading, not reviewing.
4. Test the claim, not the description: if the body says empty input is handled, feed it empty input; if it says the bug is fixed, reproduce the bug on the parent commit first.
5. Look at what the checks cannot see: silently swallowed errors, a public surface that grew, a dependency that appeared, a `null` command filled with a guess, credentials or personal data in the diff.

## The verdict

Return exactly one, and put it on the first line:

- `approve` — you ran it and found nothing that must change before it lands.
- `request changes` — with the concrete change required, each item carrying file, line and the evidence that shows it.
- `block` — only when the decision is not yours: missing access, a product decision, an external service. Say who must decide.

**Never** approve a change you did not run, and **never** approve a change to a branch you wrote in this task. A review with no findings says so plainly; it does not invent findings to look thorough, and it does not pad with praise.

## The report

Findings follow the fixed five-section schema in `.agents/prompts/code-review.md`, so that two reviewers of the same diff produce comparable reports. Lead with the verdict line, then the sections; keep it as short as the findings allow.

Every finding names the file, the line, the command or input that shows it, and what you expected instead. Separate **must fix before this lands** from **worth doing later** — a review that cannot tell them apart blocks work that should have landed, and approves work that should not.

## What a review is not

- Not a second opinion on style the formatter already enforces.
- Not a redesign of the repository, or a request for work the task did not ask for.
- Not a rewrite: if the change can land with a small fix, request the small fix. If it cannot, say what makes it unsalvageable.
