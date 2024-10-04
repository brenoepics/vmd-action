import { CodeHealth, ReportOutput, VMDAnalysis, VMDOutput } from "../types.js";
import fs from "node:fs";
import * as core from "@actions/core";
import { tagsRemover } from "./tags.js";
import { ERROR_WEIGHT } from "./constants.js";

/**
 * Parse the analysis output from the file system.
 * @param resultPath - The path to the analysis output file.
 * @returns The parsed analysis output.
 */
export function parseAnalysisOutput(
  resultPath: string
): VMDAnalysis | undefined {
  try {
    const fileContent: string = fs.readFileSync(resultPath, "utf-8");
    const cleanedContent: string = tagsRemover(fileContent);
    const parsedOutput: VMDAnalysis = JSON.parse(cleanedContent) as VMDAnalysis;

    core.debug("Parsed output:");
    for (const element of parsedOutput.codeHealthOutput) {
      core.debug(element.info);
    }

    return parsedOutput;
  } catch (error: unknown) {
    core.setFailed(
      `Failed to parse analysis output: ${(error as Error).message}`
    );
    return undefined;
  }
}

function getRelativeHealth(prHealth: CodeHealth, baseHealth: CodeHealth) {
  const codeHealth: CodeHealth = prHealth;

  codeHealth.errors -= baseHealth.errors;
  codeHealth.warnings -= baseHealth.warnings;
  codeHealth.linesCount -= baseHealth.linesCount;
  codeHealth.filesCount -= baseHealth.filesCount;
  if (codeHealth.linesCount > 0) {
    const errorsWeight: number =
      codeHealth.errors * ERROR_WEIGHT + codeHealth.warnings;
    codeHealth.points = Math.ceil(
      (1 - errorsWeight / codeHealth.linesCount) * 100
    );
  } else {
    codeHealth.points = 100;
  }

  return codeHealth;
}

/**
 * Compare the analysis results of the main branch and the pull request branch.
 * @param oldAnalysis - The analysis results of the main branch.
 * @param prBranchAnalysis - The analysis results of the pull request branch.
 * @returns The new issues introduced by the pull request branch.
 */
export function compareAnalysisResults(
  oldAnalysis: VMDAnalysis,
  prBranchAnalysis: VMDAnalysis
): VMDOutput {
  const newIssues: VMDOutput = {
    fullAnalysis: {
      output: [],
      codeHealthOutput: [],
      reportOutput: {},
      codeHealth: oldAnalysis.codeHealth
    }
  };

  if (
    prBranchAnalysis.codeHealth === undefined ||
    oldAnalysis.codeHealth === undefined
  ) {
    return newIssues;
  }

  newIssues.prHealth = getRelativeHealth(
    prBranchAnalysis.codeHealth,
    oldAnalysis.codeHealth
  );

  const prBranchFiles: [string, ReportOutput[] | undefined][] = Object.entries(
    prBranchAnalysis.reportOutput
  );

  for (const [file, issues] of prBranchFiles) {
    if (!issues) {
      newIssues.fullAnalysis.reportOutput[file] = undefined;
      continue;
    }

    if (!oldAnalysis.reportOutput[file]) {
      newIssues.fullAnalysis.reportOutput[file] = issues;
      continue;
    }

    const oldIssues: ReportOutput[] | undefined =
      oldAnalysis.reportOutput[file];
    const onlyNewIssues: ReportOutput[] = issues.filter(
      issue => !oldIssues.some(oldIssue => oldIssue.id === issue.id)
    );
    if (onlyNewIssues.length > 0) {
      newIssues.fullAnalysis.reportOutput[file] = onlyNewIssues;
    }
  }

  return newIssues;
}
