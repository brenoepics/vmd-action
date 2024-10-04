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

type RelativeHealth = {
  errors: number;
  warnings: number;
  linesChanged: number;
};

function getRelativeHealth(health: RelativeHealth): number | null {
  const codeSmells: number = health.errors * ERROR_WEIGHT + health.warnings;

  return Math.max(
    0,
    Math.min(100, Math.ceil((1 - codeSmells / health.linesChanged) * 100))
  );
}

type issuesOutput = {
  issues: { newIssues: ReportOutput[]; fixedIssues: ReportOutput[] };
  report: { [key: string]: ReportOutput[] | undefined };
};

function calculateNewIssues(
  files: [string, ReportOutput[] | undefined][],
  oldAnalysis: VMDAnalysis
): issuesOutput {
  const output: issuesOutput = {
    issues: { newIssues: [], fixedIssues: [] },
    report: {}
  };

  for (const [file, issues] of files) {
    const oldIssues: ReportOutput[] | undefined =
      oldAnalysis.reportOutput[file];

    if (!issues) {
      output.report[file] = undefined;
      if (oldIssues) {
        output.issues.fixedIssues.push(...oldIssues);
      }
      continue;
    }
    if (!oldIssues) {
      output.report[file] = issues;
      output.issues.newIssues.push(...issues);
      continue;
    }

    const onlyNewIssues: ReportOutput[] = issues.filter(
      issue => !oldIssues.some(oldIssue => oldIssue.id === issue.id)
    );
    const onlyFixedIssues: ReportOutput[] = oldIssues.filter(
      oldIssue => !issues.some(issue => issue.id === oldIssue.id)
    );

    if (onlyNewIssues.length > 0) {
      output.report[file] = onlyNewIssues;
      output.issues.newIssues.push(...onlyNewIssues);
    }

    if (onlyFixedIssues.length > 0) {
      output.issues.fixedIssues.push(...onlyFixedIssues);
    }
  }

  return output;
}

function getFilteredIssues(report: ReportOutput[], level: string) {
  return report.filter(issue => issue.level === level);
}

type RelativeResults = {
  newErrors: number;
  newPoints: number | null;
  newIssues: issuesOutput;
  fixedErrors: number;
  newWarnings: number;
  fixedWarnings: number;
};

function getRelativeResults(
  prAnalysis: VMDAnalysis,
  oldAnalysis: VMDAnalysis
): RelativeResults | undefined {
  if (
    prAnalysis.codeHealth === undefined ||
    oldAnalysis.codeHealth === undefined
  ) {
    return undefined;
  }
  const mergedEntries: [string, ReportOutput[] | undefined][] = Object.entries({
    ...Object.fromEntries(
      Object.keys(oldAnalysis.reportOutput).map(key => [key, undefined])
    ),
    ...prAnalysis.reportOutput
  });

  const newIssues: issuesOutput = calculateNewIssues(
    mergedEntries,
    oldAnalysis
  );
  const newErrors: number = getFilteredIssues(
    newIssues.issues.newIssues,
    "error"
  ).length;
  const newWarnings: number = getFilteredIssues(
    newIssues.issues.newIssues,
    "warning"
  ).length;
  const fixedErrors: number = getFilteredIssues(
    newIssues.issues.fixedIssues,
    "error"
  ).length;
  const fixedWarnings: number = getFilteredIssues(
    newIssues.issues.fixedIssues,
    "warning"
  ).length;

  const newPoints: number | null = getRelativeHealth({
    errors: newErrors + oldAnalysis.codeHealth.errors - fixedErrors,
    warnings: newWarnings + oldAnalysis.codeHealth.warnings - fixedWarnings,
    linesChanged: prAnalysis.codeHealth.linesCount
  });
  return {
    newIssues,
    newErrors,
    newWarnings,
    fixedErrors,
    fixedWarnings,
    newPoints
  };
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
      codeHealth: prBranchAnalysis.codeHealth,
      issues: { newIssues: [], fixedIssues: [] }
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

  const results: RelativeResults | undefined = getRelativeResults(
    prBranchAnalysis,
    oldAnalysis
  );

  if (results === undefined) {
    return output;
  }
  const {
    newIssues,
    newErrors,
    newWarnings,
    fixedErrors,
    fixedWarnings,
    newPoints
  } = results;

  output.relativeAnalysis = {
    codeHealth: prBranchAnalysis.codeHealth,
    prCodeHealth: {
      newErrors: newErrors,
      newWarnings: newWarnings,
      fixedErrors: fixedErrors,
      fixedWarnings: fixedWarnings,
      points: newPoints,
      linesCount:
        prBranchAnalysis.codeHealth.linesCount -
        oldAnalysis.codeHealth.linesCount,
      filesCount:
        prBranchAnalysis.codeHealth.filesCount -
        oldAnalysis.codeHealth.filesCount
    },
    issues: newIssues.issues,
    codeHealthOutput: [],
    output: [],
    reportOutput: newIssues.report
  };

  return output;
}
