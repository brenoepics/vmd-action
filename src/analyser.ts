import {
  detectManager,
  installPackage,
  runPackage
} from "./helpers/package.js";
import * as core from "@actions/core";
import { ActionInputs, getPath } from "./github/utils.js";
import { VMDAnalysis, VMDOutput } from "./types.js";
import { uploadOutputArtifact } from "./github/artifact.js";
import { commentOnPullRequest } from "./github/comments.js";
import { getCommentTemplate } from "./templates/commentTemplate.js";
import * as github from "@actions/github";
import {
  compareAnalysisResults,
  parseAnalysisOutput
} from "./helpers/parser.js";
import { runGroup } from "./helpers/group.js";
import { REPORT_PATH } from "./helpers/constants.js";
import { restoreCache, saveCache } from "./github/cache.js";
import {
  CURRENT_BRANCH,
  IS_PULL_REQUEST,
  TARGET_BRANCH
} from "./github/context.js";
import fs from "node:fs";

export async function runVueMessDetector(input: ActionInputs): Promise<void> {
  if (input.skipBots && github.context.payload.sender?.type === "Bot") {
    core.warning("Bot detected, skipping analysis!");
    return;
  }

  const pkg: string = input.packageManager || detectManager();
  await runGroup(`Install Vue Mess Detector with ${pkg}`, () =>
    runInstallGroup(pkg, input)
  );
  await runGroup("Run Vue Mess Detector", () => runAnalysisGroup(pkg, input));
  await runGroup("Upload Vue Mess Detector Report", () =>
    runUploadGroup(input)
  );
}

export async function installVMD(
  skipInstall: boolean,
  pkgManager: string,
  version: string
): Promise<void> {
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

export const runVMD: (
  pkgManager: string,
  input: ActionInputs
) => Promise<string> = (pkgManager: string, input: ActionInputs) =>
  runPackage(pkgManager, "vue-mess-detector", [
    "analyze",
    getPath(input),
    ...input.runArgs.split(" "),
    "--output=json",
    "--file-output=" + REPORT_PATH
  ]);

async function runInstallGroup(pkgManager: string, input: ActionInputs) {
  await installVMD(input.skipInstall, pkgManager, input.version);
}

async function runAnalysisGroup(pkgManager: string, input: ActionInputs) {
  const runOutput: string = await runVMD(pkgManager, input);
  core.debug(runOutput);
}

export async function commentFullReport(
  analysisOutput: VMDAnalysis,
  input: ActionInputs
): Promise<void> {
  const output: VMDOutput = {
    fullAnalysis: analysisOutput
  };
  const artifact: number | undefined = await uploadOutputArtifact(REPORT_PATH);
  const commentBody: string = getCommentTemplate(output, artifact);
  await core.summary.addRaw(commentBody).write();
  if (IS_PULL_REQUEST && input.commentsEnabled)
    await commentOnPullRequest(commentBody);
}

async function generatedRelativeArtifact(newIssues: VMDOutput) {
  const newIssuesContent: string = JSON.stringify(newIssues, null, 2);
  fs.writeFileSync(REPORT_PATH, newIssuesContent, "utf-8");
  return await uploadOutputArtifact(REPORT_PATH);
}

export async function handleResult(
  input: ActionInputs,
  analysisOutput: VMDAnalysis
): Promise<void> {
  if (!IS_PULL_REQUEST) {
    await saveCache(REPORT_PATH, CURRENT_BRANCH);
    await commentFullReport(analysisOutput, input);
    return;
  }
  if (!TARGET_BRANCH) {
    core.warning("Could not find the target branch!");
    await commentFullReport(analysisOutput, input);
    return;
  }
  core.info(
    `Comparing analysis results with base branch (${TARGET_BRANCH})...`
  );

  const oldAnalysis: VMDAnalysis | undefined = await restoreCache(
    TARGET_BRANCH,
    REPORT_PATH
  );

  if (!oldAnalysis) {
    await commentFullReport(analysisOutput, input);
    return;
  }
  const newIssues: VMDOutput = compareAnalysisResults(
    oldAnalysis,
    analysisOutput
  );
  const artifact: number | undefined =
    await generatedRelativeArtifact(newIssues);
  const newIssuesCommentBody: string = getCommentTemplate(newIssues, artifact);
  await core.summary.addRaw(newIssuesCommentBody).write();
  if (input.commentsEnabled) {
    await commentOnPullRequest(newIssuesCommentBody);
  }
}

async function runUploadGroup(input: ActionInputs) {
  const analysisOutput: VMDAnalysis | undefined =
    parseAnalysisOutput(REPORT_PATH);
  if (analysisOutput !== undefined) {
    await handleResult(input, analysisOutput);
  }
}
