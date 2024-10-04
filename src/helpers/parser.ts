import { ReportOutput, VMDAnalysis, VMDOutput } from "../types.js";
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

function getRelativeHealth({
  errors,
  warnings,
  linesCount
}: {
  errors: number;
  warnings: number;
  linesCount: number;
}) {
  const errorsWeight: number = errors * ERROR_WEIGHT + warnings;

  if (linesCount > 0) {
    return Math.ceil((1 - errorsWeight / linesCount) * 100);
  }

  return Math.ceil((1 - errorsWeight) * 100);
}

type issuesOutput = {
  issues: { totalErrors: number; totalWarnings: number };
  report: { [key: string]: ReportOutput[] | undefined };
};

function getTotalIssues(issues: ReportOutput[], level: string): number {
  return issues.filter(issue => issue.level === level).length;
}

function calculateNewIssues(
  prBranchFiles: [string, ReportOutput[] | undefined][],
  oldAnalysis: VMDAnalysis
): issuesOutput {
  const output: issuesOutput = {
    issues: { totalErrors: 0, totalWarnings: 0 },
    report: {}
  };

  for (const [file, issues] of prBranchFiles) {
    if (!issues) {
      output.report[file] = undefined;
      continue;
    }

    if (!oldAnalysis.reportOutput[file]) {
      output.report[file] = issues;
      continue;
    }

    output.issues.totalErrors += getTotalIssues(issues, "error");
    output.issues.totalWarnings += getTotalIssues(issues, "warning");
    const oldIssues: ReportOutput[] | undefined =
      oldAnalysis.reportOutput[file];
    const onlyNewIssues: ReportOutput[] = issues.filter(
      issue => !oldIssues.some(oldIssue => oldIssue.id === issue.id)
    );
    if (onlyNewIssues.length > 0) {
      output.report[file] = onlyNewIssues;
    }
  }

  return output;
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
    relativeAnalysis: {
      output: [],
      codeHealthOutput: [],
      reportOutput: {},
      codeHealth: prBranchAnalysis.codeHealth
    },
    fullAnalysis: prBranchAnalysis
  };

  if (
    prBranchAnalysis.codeHealth === undefined ||
    oldAnalysis.codeHealth === undefined ||
    output.relativeAnalysis === undefined
  ) {
    return output;
  }

  const newIssues: issuesOutput = calculateNewIssues(
    Object.entries(prBranchAnalysis.reportOutput),
    oldAnalysis
  );

  const points: number | null = getRelativeHealth({
    errors: newIssues.issues.totalErrors,
    warnings: newIssues.issues.totalWarnings,
    linesCount: prBranchAnalysis.codeHealth.linesCount
  });
  output.relativeAnalysis.prCodeHealth = {
    errors: newIssues.issues.totalErrors,
    warnings: newIssues.issues.totalWarnings,
    points: points,
    linesCount:
      prBranchAnalysis.codeHealth.linesCount -
      oldAnalysis.codeHealth.linesCount,
    filesCount:
      prBranchAnalysis.codeHealth.filesCount - oldAnalysis.codeHealth.filesCount
  };

  return output;
}
