# Repository settings

Every repository in the organisation carries the same baseline, and it is set in two places: the repository's own settings, which decide what the interface offers, and the **Baseline** ruleset, which decides what the default branch accepts. The ruleset is the half nobody steps around. Its bypass list is empty, so no user, team, application or administrator is exempt from it.

The baseline is what a repository is expected to carry in full. A repository whose settings differ is behind the baseline, not an exception to it, and its own Settings ▸ General and Settings ▸ Rules ▸ Rulesets are the live record of what it does.

## Merging

Rebase only: the default branch moves one commit at a time, and a change lands as its own commits.

- Merge commits and squash merges are off, and the ruleset's pull-request rule accepts `rebase` as the only merge method, so the merge box offers **Rebase and merge** and nothing else.
- Linear history is required, so a branch that contains a merge commit is refused instead of being flattened on the way in.
- The head branch is deleted when a pull request merges. Branch off the default branch, keep the branch local to the work, and expect it to be gone afterwards.
- Auto-merge is off: a pull request merges when someone merges it, after review.
- **Update branch** is off. Rebase your branch on the default branch and force-push your own branch, which is safe on a branch only you work on.

## Pull requests

Everything on the default branch arrives through a pull request, and a push straight to that branch is refused.

- One approving review is required, and the author's own approval does not count.
- A commit GitHub cannot attribute to an account needs one approval beyond that. Work pushed under an identity that is not linked to the account it belongs to takes a second review, so link the identity before the push.
- A push to the branch after a review dismisses that review's approval, so an approval covers the commits it was given for: push first, and ask for review on what will merge.
- Force-pushing the default branch, and deleting it, are refused.
- The ruleset matches the default branch itself (`~DEFAULT_BRANCH`) rather than the name `main`, so the rules follow a rename of it.
- No check is required to merge. Continuous integration runs, and a red run is worth reading before approving, but the approval is what stops a merge.
- Code-owner review, review of the last push, and review-thread resolution are not required.
- The bypass list is empty, so there is no emergency lane: a rule that is wrong is fixed by a pull request against the ruleset.

## Actions

- Actions are enabled, and the workflow token is read-only by default with `can_approve_pull_request_reviews` false: a workflow cannot write to the repository, and it cannot approve a pull request.
- The allowed set is the GitHub-owned actions and the actions of verified creators, plus the single third-party action the organisation pins: `oven-sh/setup-bun@*`. An action outside that set does not run.

## Features

Issues are on, and Discussions are off. The wiki and Projects are off: a repository here carries one place to raise and discuss work, and documents are files under review rather than pages outside it.

## Security

- Secret scanning runs with push protection: a credential pushed to a repository is refused at the push rather than reported after it.
- Dependabot alerts are on, so a vulnerable dependency is reported, and security updates are on, so its patch arrives as a pull request of its own.

## Reading the settings

Settings ▸ Rules ▸ Rulesets in a repository shows the Baseline ruleset, its rules and its empty bypass list. The same records come from the API, with `<repository>` replaced by its name:

```sh
gh api repos/aivara-se/<repository>/rulesets          # the Baseline ruleset, with its id
gh api repos/aivara-se/<repository>/rulesets/<id>     # its rules, conditions and bypass list
```
