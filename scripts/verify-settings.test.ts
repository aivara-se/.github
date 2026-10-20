import { describe, expect, test } from "bun:test";

import { checkNames, triggerNames, validateGate } from "./verify-settings.ts";

function workflow(text: string): Record<string, any> {
  return Bun.YAML.parse(text) as Record<string, any>;
}

describe("validateGate", () => {
  test("a workflow named validate whose job is named otherwise reports no validate check", () => {
    const gate = validateGate([
      workflow(`name: validate\non:\n  pull_request:\njobs:\n  checks:\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate).toEqual({ named: true, pullRequest: true, checkName: false });
  });

  test("a job keyed validate reports the check", () => {
    const gate = validateGate([
      workflow(`name: validate\non:\n  pull_request:\njobs:\n  validate:\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate).toEqual({ named: true, pullRequest: true, checkName: true });
  });

  test("a job keyed otherwise but named validate reports the check", () => {
    const gate = validateGate([
      workflow(`name: validate\non: [pull_request]\njobs:\n  checks:\n    name: validate\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate).toEqual({ named: true, pullRequest: true, checkName: true });
  });

  test("a trigger written as a single name reads as a list of one", () => {
    const gate = validateGate([
      workflow(`name: validate\non: pull_request\njobs:\n  validate:\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate.pullRequest).toBe(true);
  });

  test("a workflow run by hand alone does not run on pull requests", () => {
    const gate = validateGate([
      workflow(`name: validate\non:\n  workflow_dispatch:\njobs:\n  validate:\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate).toEqual({ named: true, pullRequest: false, checkName: true });
  });

  test("a repository with no workflow named validate carries no gate", () => {
    const gate = validateGate([workflow(`name: deploy\non:\n  pull_request:\njobs:\n  validate:\n    runs-on: ubuntu-latest\n`)]);
    expect(gate).toEqual({ named: false, pullRequest: false, checkName: false });
  });

  test("two workflows named validate satisfy the gate between them", () => {
    const gate = validateGate([
      workflow(`name: validate\non:\n  workflow_dispatch:\njobs:\n  verify:\n    runs-on: ubuntu-latest\n`),
      workflow(`name: validate\non:\n  pull_request:\njobs:\n  validate:\n    runs-on: ubuntu-latest\n`),
    ]);
    expect(gate).toEqual({ named: true, pullRequest: true, checkName: true });
  });
});

describe("triggerNames", () => {
  test("reads a single name, a list, and the keys of a map", () => {
    expect(triggerNames("pull_request")).toEqual(["pull_request"]);
    expect(triggerNames(["pull_request", "push"])).toEqual(["pull_request", "push"]);
    expect(triggerNames({ pull_request: null, workflow_dispatch: null })).toEqual(["pull_request", "workflow_dispatch"]);
    expect(triggerNames(null)).toEqual([]);
  });
});

describe("checkNames", () => {
  test("falls back to the job key and ignores a null job", () => {
    expect(checkNames({ validate: { "runs-on": "ubuntu-latest" } })).toEqual(["validate"]);
    expect(checkNames({ checks: { name: "validate" } })).toEqual(["validate"]);
    expect(checkNames({ empty: null })).toEqual(["empty"]);
    expect(checkNames(null)).toEqual([]);
  });
});
