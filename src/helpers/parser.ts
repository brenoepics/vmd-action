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

function getRelativeHealth(
  prHealth: CodeHealth,
  baseHealth: CodeHealth | undefined
) {
  if (!baseHealth) {
    return prHealth;
  }

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
 * Calculate the total number of errors and warnings from the report output.
 * @param reportOutput - The report output to calculate from.
 * @returns An object containing the total errors and warnings.
 */
function calculateIssues(reportOutput: {
  [key: string]: ReportOutput[] | undefined;
}): { totalErrors: number; totalWarnings: number } {
  let totalErrors: number = 0;
  let totalWarnings: number = 0;

  for (const issues of Object.values(reportOutput)) {
    if (!issues) {
      continue;
    }
    for (const issue of issues) {
      if (issue.level === "error") {
        totalErrors++;
      } else if (issue.level === "warning") {
        totalWarnings++;
      }
    }
  }

  return { totalErrors, totalWarnings };
}

function calculateNewIssues(
  prBranchFiles: [string, ReportOutput[] | undefined][],
  output: VMDOutput,
  oldAnalysis: VMDAnalysis
) {
  for (const [file, issues] of prBranchFiles) {
    if (!issues) {
      output.fullAnalysis.reportOutput[file] = undefined;
      continue;
    }

    if (!oldAnalysis.reportOutput[file]) {
      output.fullAnalysis.reportOutput[file] = issues;
      continue;
    }

    const oldIssues: ReportOutput[] | undefined =
      oldAnalysis.reportOutput[file];
    const onlyNewIssues: ReportOutput[] = issues.filter(
      issue => !oldIssues.some(oldIssue => oldIssue.id === issue.id)
    );
    if (onlyNewIssues.length > 0) {
      output.fullAnalysis.reportOutput[file] = onlyNewIssues;
    }
  }
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
  const output: VMDOutput = {
    fullAnalysis: {
      output: [],
      codeHealthOutput: [],
      reportOutput: {},
      codeHealth: oldAnalysis.codeHealth
    },
    prHealth: prBranchAnalysis.codeHealth
  };

  if (
    prBranchAnalysis.codeHealth === undefined ||
    oldAnalysis.codeHealth === undefined
  ) {
    return output;
  }

  calculateNewIssues(
    Object.entries(prBranchAnalysis.reportOutput),
    output,
    oldAnalysis
  );

  const total: { totalErrors: number; totalWarnings: number } = calculateIssues(
    output.fullAnalysis.reportOutput
  );

  prBranchAnalysis.codeHealth.errors = total.totalErrors;
  prBranchAnalysis.codeHealth.warnings = total.totalWarnings;

  output.prHealth = getRelativeHealth(
    prBranchAnalysis.codeHealth,
    output.fullAnalysis.codeHealth
  );

  return output;
}
