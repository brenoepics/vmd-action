import { getPath, ActionInputs } from "../src/github/utils.js";
import Path from "node:path";
import { describe, expect, it } from "vitest";


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

