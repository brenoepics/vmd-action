import { detectManager, installPackage, runPackage } from "./packageManager.js";
import * as core from "@actions/core";
import { ActionInputs, getPath, isPullRequest } from "./github/utils.js";
import { VMDAnalysis } from "./types.js";
import fs from "node:fs";
import { uploadOutputArtifact } from "./github/artifact.js";
import { commentOnPullRequest } from "./github/comments.js";

const coveragePath: string = "vmd-analysis.json";

async function installVMD(
  skipInstall: boolean,
  pkgManager: string,
  version: string
) {
  if (skipInstall) {
    core.info("Skipping installation of vue-mess-detector!");
    return;
  }

  const stdout: string = await installPackage(
    pkgManager,
    `vue-mess-detector@${version}`
  );
  core.debug(stdout);
}

const runVMD: (pkgManager: string, input: ActionInputs) => Promise<string> = (
  pkgManager: string,
  input: ActionInputs
) =>
  runPackage(pkgManager, "vue-mess-detector", [
    "analyze",
    getPath(input),
    ...input.runArgs.split(" "),
    "--output=json",
    "--file-output=" + coveragePath
  ]);

export async function runVueMessDetector(input: ActionInputs): Promise<void> {
  try {
    const pkgManager: string = input.packageManager || detectManager();
    core.info(`Detected package manager: ${pkgManager}`);

    await installVMD(input.skipInstall, pkgManager, input.version);

    const runOutput: string = await runVMD(pkgManager, input);
    core.debug(runOutput);

    const analysisOutput: VMDAnalysis = parseAnalysisOutput(coveragePath);

    const artifact: number | undefined =
      await uploadOutputArtifact(coveragePath);

    if (isPullRequest() && input.commentsEnabled) {
      await commentOnPullRequest(analysisOutput, artifact);
    }
  } catch (error: unknown) {
    core.setFailed(error instanceof Error ? error.message : "Unknown error");
  }
}

export function parseAnalysisOutput(resultPath: string): VMDAnalysis {
  try {
    const fileContent: string = fs.readFileSync(resultPath, "utf-8");
    const tagRegex: RegExp = /<[^>]+>/g;

    const cleanedContent: string = fileContent.replace(tagRegex, "");
    const parsedOutput: VMDAnalysis = JSON.parse(cleanedContent) as VMDAnalysis;

    core.info("Parsed output:");
    parsedOutput.codeHealthOutput.forEach(element => {
      core.info(element.info);
    });

    return parsedOutput;
  } catch (error: unknown) {
    core.setFailed(
      `Failed to parse analysis output: ${(error as Error).message}`
    );
    throw error;
  }
}
