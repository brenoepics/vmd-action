import * as core from "@actions/core";
import * as github from "@actions/github";
import Path from "node:path";

export const isPullRequest: () => boolean = (): boolean =>
  github.context.payload.pull_request !== undefined;

export function getPath(input: ActionInputs): string {
  try {
    return Path.resolve(process.cwd() + "/" + input.srcDir);
  } catch (error: unknown) {
    core.warning(
      "Could not find the source directory. Using the current working directory instead."
    );
    return process.cwd();
  }
}

export interface ActionInputs {
  version: string;
  skipInstall: boolean;
  packageManager: string;
  runArgs: string;
  entryPoint: string;
  srcDir: string;
  commentsEnabled: boolean;
  skipBots: boolean;
}

export const readActionInputs: () => ActionInputs = (): ActionInputs => ({
  version: core.getInput("version", { required: true }),
  skipInstall: core.getInput("skipInstall", { required: true }) === "true",
  packageManager: core.getInput("packageManager", { required: false }),
  runArgs: core.getInput("runArgs", { required: false }),
  entryPoint: core.getInput("entryPoint", { required: false }),
  srcDir: core.getInput("srcDir", { required: false }),
  commentsEnabled: core.getBooleanInput("commentsEnabled", { required: true }),
  skipBots: core.getBooleanInput("skipBots", { required: true }),
});
