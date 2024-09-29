import { isPullRequest, getPath, ActionInputs } from "../src/github/utils.js";
import * as github from "@actions/github";
import Path from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@actions/github");
describe("isPullRequest", () => {
  it("should return true if the context is a pull request", () => {
    github.context.payload = { pull_request: {number: 1} };
    expect(isPullRequest()).toBe(true);
  });

  it("should return false if the context is not a pull request", () => {
    github.context.payload = {};
    expect(isPullRequest()).toBe(false);
  });
});

describe("getPath", () => {
  it("should return the resolved path based on the input srcDir", () => {
    const input: ActionInputs = {
      version: "latest",
      skipInstall: false,
      packageManager: "npm",
      runArgs: "",
      entryPoint: "",
      srcDir: "src",
      commentsEnabled: true,
      skipBots: false,
      relativeMode: false
    };
    const resolvedPath = Path.resolve(process.cwd() + "/" + input.srcDir);
    expect(getPath(input)).toBe(resolvedPath);
  });

  it("should return the current working directory if srcDir is invalid", () => {
    const input: ActionInputs = {
      version: "latest",
      skipInstall: false,
      packageManager: "npm",
      runArgs: "",
      entryPoint: "",
      srcDir: "",
      commentsEnabled: true,
      skipBots: false,
      relativeMode: false
    };
    expect(getPath(input)).toBe(process.cwd());
  });
});

