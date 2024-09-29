import { runVueMessDetector } from "../src/analyser";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { ActionInputs } from "../src/github/utils";
import { VMDAnalysis } from "../src/types";
import { uploadOutputArtifact } from "../src/github/artifact";
import { commentOnPullRequest } from "../src/github/comments";
import { getCommentTemplate } from "../src/templates/commentTemplate";
import { compareAnalysisResults, parseAnalysisOutput } from "../src/helpers/parser";
import { restoreCache, saveCache } from "../src/github/cache";
import { CURRENT_BRANCH, IS_PULL_REQUEST, TARGET_BRANCH } from "../src/github/context";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../src/github/artifact");
jest.mock("../src/github/comments");
jest.mock("../src/templates/commentTemplate");
jest.mock("../src/helpers/parser");
jest.mock("../src/github/cache");
jest.mock("../src/github/context");

describe("runVueMessDetector", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip analysis for bot users", async () => {
    github.context.payload = { sender: { type: "Bot" } };
    input.skipBots = true;

    await runVueMessDetector(input);

    expect(core.warning).toHaveBeenCalledWith("Bot detected, skipping analysis!");
  });

  it("should run analysis and upload report", async () => {
    github.context.payload = { sender: { type: "User" } };
    input.skipBots = false;

    await runVueMessDetector(input);

    expect(core.warning).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith("Vue Mess Detector has finished running!");
  });
});

describe("installVMD", () => {
  it("should skip installation if skipInstall is true", async () => {
    const installPackage = jest.fn();
    const input = { skipInstall: true, pkgManager: "npm", version: "latest" };

    await installVMD(input.skipInstall, input.pkgManager, input.version);

    expect(installPackage).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenCalledWith("Skipping installation of vue-mess-detector!");
  });

  it("should install VMD if skipInstall is false", async () => {
    const installPackage = jest.fn();
    const input = { skipInstall: false, pkgManager: "npm", version: "latest" };

    await installVMD(input.skipInstall, input.pkgManager, input.version);

    expect(installPackage).toHaveBeenCalledWith("npm", "vue-mess-detector@latest");
  });
});

describe("runVMD", () => {
  it("should run VMD with the correct arguments", async () => {
    const runPackage = jest.fn();
    const input = { pkgManager: "npm", runArgs: "", srcDir: "" };

    await runVMD(input.pkgManager, input);

    expect(runPackage).toHaveBeenCalledWith("npm", "vue-mess-detector", [
      "analyze",
      process.cwd(),
      "--output=json",
      "--file-output=vmd-analysis.json"
    ]);
  });
});

describe("commentFullReport", () => {
  it("should add a summary and comment on pull request if enabled", async () => {
    const analysisOutput: VMDAnalysis = { output: [], codeHealthOutput: [], reportOutput: {} };
    const artifact = 1;
    const input = { commentsEnabled: true };

    await commentFullReport(analysisOutput, artifact, input);

    expect(core.summary.addRaw).toHaveBeenCalled();
    expect(commentOnPullRequest).toHaveBeenCalled();
  });

  it("should only add a summary if comments are disabled", async () => {
    const analysisOutput: VMDAnalysis = { output: [], codeHealthOutput: [], reportOutput: {} };
    const artifact = 1;
    const input = { commentsEnabled: false };

    await commentFullReport(analysisOutput, artifact, input);

    expect(core.summary.addRaw).toHaveBeenCalled();
    expect(commentOnPullRequest).not.toHaveBeenCalled();
  });
});

describe("handleResult", () => {
  it("should save cache and comment full report if not a pull request", async () => {
    const input = { commentsEnabled: true };
    const analysisOutput: VMDAnalysis = { output: [], codeHealthOutput: [], reportOutput: {} };
    const artifact = 1;

    await handleResult(input, analysisOutput, artifact);

    expect(saveCache).toHaveBeenCalledWith("vmd-analysis.json", CURRENT_BRANCH);
    expect(commentFullReport).toHaveBeenCalledWith(analysisOutput, artifact, input);
  });

  it("should compare analysis results and comment new issues if a pull request", async () => {
    const input = { commentsEnabled: true };
    const analysisOutput: VMDAnalysis = { output: [], codeHealthOutput: [], reportOutput: {} };
    const artifact = 1;
    const IS_PULL_REQUEST = true;
    const TARGET_BRANCH = "main";

    await handleResult(input, analysisOutput, artifact);

    expect(compareAnalysisResults).toHaveBeenCalled();
    expect(commentFullReport).toHaveBeenCalledWith(analysisOutput, artifact, input);
  });
});
