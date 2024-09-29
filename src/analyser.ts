import {
  detectManager,
  installPackage,
  runPackage
} from "./helpers/package.js";
import * as core from "@actions/core";
import { ActionInputs, getPath, isPullRequest } from "./github/utils.js";
import { VMDAnalysis } from "./types.js";
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
import { baseBranch, isBaseBranch, sourceBranch } from "./github/context.js";

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
    "--file-output=" + REPORT_PATH
  ]);

async function runInstallGroup(pkgManager: string, input: ActionInputs) {
  await installVMD(input.skipInstall, pkgManager, input.version);
}

async function runAnalysisGroup(pkgManager: string, input: ActionInputs) {
  const runOutput: string = await runVMD(pkgManager, input);
  core.debug(runOutput);
}

async function commentFullReport(
  analysisOutput: VMDAnalysis,
  artifact: number,
  input: ActionInputs
) {
  const commentBody: string = getCommentTemplate(analysisOutput, artifact);
  await core.summary.addRaw(commentBody).write();
  if (isPullRequest() && input.commentsEnabled)
    await commentOnPullRequest(commentBody);
}

async function handleResult(
  input: ActionInputs,
  analysisOutput: VMDAnalysis,
  artifact: number
) {
  if (!isPullRequest()) {
    await commentFullReport(analysisOutput, artifact, input);
  } else {
    const baseAnalysis: VMDAnalysis | undefined = await restoreCache(
      isPullRequest() ? baseBranch : sourceBranch
    );

    if (!baseAnalysis) {
      await commentFullReport(analysisOutput, artifact, input);
    } else {
      const newIssues: VMDAnalysis = compareAnalysisResults(
        baseAnalysis,
        analysisOutput
      );
      const newIssuesCommentBody: string = getCommentTemplate(
        newIssues,
        artifact
      );
      await core.summary.addRaw(newIssuesCommentBody).write();
      if (input.commentsEnabled) {
        await commentOnPullRequest(newIssuesCommentBody);
      }
    }
  }

  if (isBaseBranch && !isPullRequest()) {
    await saveCache(REPORT_PATH, sourceBranch);
  }
}

async function runUploadGroup(input: ActionInputs) {
  const analysisOutput: VMDAnalysis | undefined =
    parseAnalysisOutput(REPORT_PATH);
  const artifact: number | undefined = await uploadOutputArtifact(REPORT_PATH);
  if (!(analysisOutput === undefined || artifact === undefined)) {
    await handleResult(input, analysisOutput, artifact);
  }
}
