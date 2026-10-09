#!/usr/bin/env bun
/**
 * Checks every repository in the organisation against docs/SETTINGS.md, and prints
 * every setting that differs. The document is the specification and this file is its
 * enforcement, so a change to one belongs in the same change as the other.
 *
 *   bun run verify-settings                    every repository of aivara-se
 *   bun run verify-settings --repo keysmash    the named repositories only
 *   bun run verify-settings --json             findings as JSON
 *
 * The token must be able to read settings on every repository in the organisation
 * (repository administration read):
 *
 *   GH_TOKEN=$(gh auth token) bun run verify-settings
 *
 * The verify-settings workflow reads it from the ORG_READ_TOKEN secret. A missing token
 * exits 2 with that message rather than reporting every repository as broken.
 *
 * Exit status: 0 every repository matches, 1 at least one setting differs,
 * 2 no usable token or unusable arguments.
 */

const API = "https://api.github.com";
const DOCUMENT = "docs/SETTINGS.md";

/**
 * Every value here is a line of the document. The document says what the
 * organisation requires; this is the same requirement in a form a program can
 * compare against a repository.
 */
const BASELINE = {
  repository: {
    allow_merge_commit: false,
    allow_squash_merge: false,
    allow_rebase_merge: true,
    delete_branch_on_merge: true,
    allow_auto_merge: false,
    allow_update_branch: false,
    has_issues: true,
    has_discussions: false,
    has_wiki: false,
    has_projects: false,
  },
  ruleset: {
    name: "Baseline",
    target: "branch",
    enforcement: "active",
    conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
    bypass_actors: 0,
    required_rules: ["deletion", "non_fast_forward", "required_linear_history", "pull_request"],
    forbidden_rules: ["required_status_checks"],
    pull_request: {
      required_approving_review_count: 1,
      dismiss_stale_reviews_on_push: true,
      require_extra_approval_for_unattributed_changes: true,
      require_code_owner_review: false,
      require_last_push_approval: false,
      required_review_thread_resolution: false,
      allowed_merge_methods: ["rebase"],
    },
  },
  actions: {
    enabled: true,
    allowed_actions: "selected",
    selected_actions: {
      github_owned_allowed: true,
      verified_allowed: true,
      patterns_allowed: ["oven-sh/setup-bun@*"],
    },
    workflow: {
      default_workflow_permissions: "read",
      can_approve_pull_request_reviews: false,
    },
  },
  security: {
    secret_scanning: "enabled",
    secret_scanning_push_protection: "enabled",
    dependabot_security_updates: "enabled",
    dependabot_alerts: true,
    automated_security_fixes: true,
  },
} as const;

/**
 * The same settings, by the name each API uses for them. The document and the REST
 * repository object call it `allow_merge_commit`; a read-only token can only read it
 * as GraphQL's `mergeCommitAllowed`. The right-hand names build the query below.
 */
const REPOSITORY_SETTINGS = {
  mergeCommitAllowed: "allow_merge_commit",
  squashMergeAllowed: "allow_squash_merge",
  rebaseMergeAllowed: "allow_rebase_merge",
  deleteBranchOnMerge: "delete_branch_on_merge",
  autoMergeAllowed: "allow_auto_merge",
  allowUpdateBranch: "allow_update_branch",
  hasIssuesEnabled: "has_issues",
  hasDiscussionsEnabled: "has_discussions",
  hasWikiEnabled: "has_wiki",
  hasProjectsEnabled: "has_projects",
} as const;

const REPOSITORY_SETTINGS_QUERY = `query ($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) { ${Object.keys(REPOSITORY_SETTINGS).join(" ")} }
}`;

type Json = Record<string, any>;

interface Finding {
  repository: string;
  setting: string;
  expected: string;
  actual: string;
}

interface Result {
  repository: string;
  findings: Finding[];
}

interface Options {
  org: string;
  repositories: string[];
  json: boolean;
}

function usage(): never {
  console.error([
    `usage: bun run verify-settings [--org NAME] [--repo NAME]... [--json]`,
    ``,
    `  --org NAME    organisation to check (default aivara-se)`,
    `  --repo NAME   check one repository, repeatable (default: every repository)`,
    `  --json        print findings as JSON`,
    ``,
    `Reads a token from GH_TOKEN or GITHUB_TOKEN; it must read repository`,
    `administration across the organisation.`,
  ].join("\n"));
  process.exit(2);
}

function parseArguments(argv: string[]): Options {
  const options: Options = { org: "aivara-se", repositories: [], json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") usage();
    else if (argument === "--json") options.json = true;
    else if (argument === "--org") options.org = argv[++index] ?? "";
    else if (argument === "--repo") options.repositories.push(argv[++index] ?? "");
    else usage();
  }
  if (options.repositories.some((name) => name.length === 0) || options.org.length === 0) usage();
  return options;
}

function token(): string {
  const value = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!value) {
    console.error([
      `verify-settings needs a token that reads repository administration across ${"the organisation"}.`,
      ``,
      `  locally   GH_TOKEN=$(gh auth token) bun run verify-settings`,
      `  in CI     set the ORG_READ_TOKEN repository secret`,
    ].join("\n"));
    process.exit(2);
  }
  return value;
}

async function request(path: string, auth: string): Promise<{ status: number; body: any }> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      authorization: `Bearer ${auth}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "aivara-se-verify-settings",
    },
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function graphql(query: string, variables: Json, auth: string): Promise<any> {
  const response = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${auth}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "aivara-se-verify-settings",
    },
    body: JSON.stringify({ query, variables }),
  });
  return await response.json();
}

async function repositoriesOf(org: string, auth: string): Promise<string[]> {
  const names: string[] = [];
  for (let page = 1; ; page += 1) {
    const { status, body } = await request(`/orgs/${org}/repos?per_page=100&page=${page}`, auth);
    if (status !== 200 || !Array.isArray(body)) {
      console.error(`cannot list the repositories of ${org}: HTTP ${status} ${JSON.stringify(body)}`);
      process.exit(2);
    }
    names.push(...body.map((repository: Json) => repository.name as string));
    if (body.length < 100) return names.sort();
  }
}

/** Runs the repositories through a small pool so the check finishes in seconds. */
async function pooled<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await run(items[index] as T);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Settings are compared by value, so key order and the order of the entries in a
 * list are not differences: `{a,b}` equals `{b,a}`, and `["x","y"]` equals
 * `["y","x"]`.
 */
function canonical(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).sort().join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Json).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function checkRepository(org: string, repository: string, auth: string): Promise<Result> {
  const findings: Finding[] = [];
  const record = (setting: string, expected: unknown, actual: unknown): void => {
    findings.push({ repository, setting, expected: canonical(expected), actual: canonical(actual) });
  };
  const expect = (setting: string, actual: unknown, expected: unknown): void => {
    if (canonical(actual) !== canonical(expected)) record(setting, expected, actual);
  };

  const repo = await request(`/repos/${org}/${repository}`, auth);
  if (repo.status !== 200) {
    record("repository is readable", "HTTP 200", `HTTP ${repo.status}`);
    return { repository, findings };
  }

  // The repository-level settings come from GraphQL. The REST repository object
  // omits them for a fine-grained token that holds administration read, and the
  // two APIs name every one of these fields differently.
  const answer = await graphql(REPOSITORY_SETTINGS_QUERY, { owner: org, name: repository }, auth);
  const node = answer.data?.repository;
  if (!node) {
    record("repository is readable", "readable", answer.errors?.[0]?.message ?? "no repository returned");
  } else {
    for (const [field, setting] of Object.entries(REPOSITORY_SETTINGS)) {
      expect(`repository.${setting}`, node[field], (BASELINE.repository as Json)[setting]);
    }
  }

  const listed = await request(`/repos/${org}/${repository}/rulesets`, auth);
  const summary = Array.isArray(listed.body)
    ? listed.body.find((ruleset: Json) => ruleset.name === BASELINE.ruleset.name)
    : undefined;
  if (!summary) {
    record(`ruleset.${BASELINE.ruleset.name}`, "present", `absent or unreadable (HTTP ${listed.status})`);
  } else {
    const { body: ruleset } = await request(`/repos/${org}/${repository}/rulesets/${summary.id}`, auth);
    expect("ruleset.enforcement", ruleset.enforcement, BASELINE.ruleset.enforcement);
    expect("ruleset.target", ruleset.target, BASELINE.ruleset.target);
    expect("ruleset.conditions", ruleset.conditions, BASELINE.ruleset.conditions);
    expect("ruleset.bypass_actors", (ruleset.bypass_actors ?? []).length, BASELINE.ruleset.bypass_actors);
    const types: string[] = (ruleset.rules ?? []).map((rule: Json) => rule.type);
    for (const required of BASELINE.ruleset.required_rules) {
      if (!types.includes(required)) record(`ruleset.rules.${required}`, "present", "absent");
    }
    for (const forbidden of BASELINE.ruleset.forbidden_rules) {
      if (types.includes(forbidden)) record(`ruleset.rules.${forbidden}`, "absent", "present");
    }
    const pullRequest = (ruleset.rules ?? []).find((rule: Json) => rule.type === "pull_request")?.parameters;
    if (!pullRequest) {
      record("ruleset.rules.pull_request.parameters", "present", "absent");
    } else {
      for (const [setting, expected] of Object.entries(BASELINE.ruleset.pull_request)) {
        expect(`ruleset.pull_request.${setting}`, pullRequest[setting], expected);
      }
    }
  }

  const permissions = await request(`/repos/${org}/${repository}/actions/permissions`, auth);
  if (permissions.status !== 200) {
    record("actions.permissions", "HTTP 200", `HTTP ${permissions.status}`);
  } else {
    expect("actions.enabled", permissions.body.enabled, BASELINE.actions.enabled);
    expect("actions.allowed_actions", permissions.body.allowed_actions, BASELINE.actions.allowed_actions);
  }

  const selected = await request(`/repos/${org}/${repository}/actions/permissions/selected-actions`, auth);
  if (selected.status !== 200) {
    record("actions.selected_actions", "HTTP 200", `HTTP ${selected.status}`);
  } else {
    for (const [setting, expected] of Object.entries(BASELINE.actions.selected_actions)) {
      expect(`actions.selected_actions.${setting}`, selected.body[setting], expected);
    }
  }

  const workflow = await request(`/repos/${org}/${repository}/actions/permissions/workflow`, auth);
  if (workflow.status !== 200) {
    record("actions.workflow", "HTTP 200", `HTTP ${workflow.status}`);
  } else {
    for (const [setting, expected] of Object.entries(BASELINE.actions.workflow)) {
      expect(`actions.workflow.${setting}`, workflow.body[setting], expected);
    }
  }

  const analysis = repo.body.security_and_analysis;
  if (!analysis) {
    record("repository.security_and_analysis", "returned", "missing: the token lacks administration read");
  } else {
    expect("security.secret_scanning", analysis.secret_scanning?.status, BASELINE.security.secret_scanning);
    expect(
      "security.secret_scanning_push_protection",
      analysis.secret_scanning_push_protection?.status,
      BASELINE.security.secret_scanning_push_protection,
    );
    expect(
      "security.dependabot_security_updates",
      analysis.dependabot_security_updates?.status,
      BASELINE.security.dependabot_security_updates,
    );
  }

  // 204 with alerts on, 404 with them off.
  const alerts = await request(`/repos/${org}/${repository}/vulnerability-alerts`, auth);
  expect("security.dependabot_alerts", alerts.status === 204, BASELINE.security.dependabot_alerts);

  const fixes = await request(`/repos/${org}/${repository}/automated-security-fixes`, auth);
  if (fixes.status !== 200) {
    record("security.automated_security_fixes", "HTTP 200", `HTTP ${fixes.status}`);
  } else {
    expect("security.automated_security_fixes.enabled", fixes.body.enabled, BASELINE.security.automated_security_fixes);
    expect("security.automated_security_fixes.paused", fixes.body.paused, false);
  }

  return { repository, findings };
}

function printText(results: Result[], org: string): void {
  const findings = results.flatMap((result) => result.findings);
  console.log(`verify-settings: ${results.length} repositories in ${org}, checked against ${DOCUMENT}\n`);
  for (const result of results) {
    if (result.findings.length === 0) {
      console.log(`${result.repository}  ok`);
      continue;
    }
    console.log(`${result.repository}  ${result.findings.length} finding${result.findings.length === 1 ? "" : "s"}`);
    for (const finding of result.findings) {
      console.log(`  ${finding.setting}\n    expected ${finding.expected}\n    found    ${finding.actual}`);
    }
  }
  const total = results.length;
  console.log(
    findings.length === 0
      ? `\nall ${total} ${total === 1 ? "repository matches" : "repositories match"} ${DOCUMENT}`
      : `\n${findings.length} finding${findings.length === 1 ? "" : "s"} across ${results.filter((r) => r.findings.length > 0).length} of ${total} repositories`,
  );
}

async function main(): Promise<void> {
  const options = parseArguments(Bun.argv.slice(2));
  const auth = token();
  const repositories = options.repositories.length > 0
    ? options.repositories
    : await repositoriesOf(options.org, auth);

  const results = await pooled(repositories, 4, (repository) => checkRepository(options.org, repository, auth));

  if (options.json) {
    console.log(JSON.stringify({ org: options.org, document: DOCUMENT, results }, null, 2));
  } else {
    printText(results, options.org);
  }
  process.exit(results.some((result) => result.findings.length > 0) ? 1 : 0);
}

await main();
