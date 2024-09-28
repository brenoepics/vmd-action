import { ReportOutput, VMDAnalysis } from "../types.js";
import fs from "node:fs";
import * as core from "@actions/core";
import { tagsRemover } from "./tags.js";

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

function filterResults(
  mainBranchAnalysis: VMDAnalysis,
  file: string,
  newIssues: VMDAnalysis,
  issues: ReportOutput[]
) {
  const mainBranchIssues: ReportOutput[] =
    mainBranchAnalysis.reportOutput[file].length > 0
      ? mainBranchAnalysis.reportOutput[file]
      : [];
  const newFileIssues: ReportOutput[] = issues.filter(
    issue =>
      !mainBranchIssues.some(
        mainIssue =>
          mainIssue.id === issue.id && mainIssue.message === issue.message
      )
  );
  if (newFileIssues.length > 0) {
    newIssues.reportOutput[file] = newFileIssues;
  }
}

/**
 * Compare the analysis results of the main branch and the pull request branch.
 * @param mainBranchAnalysis - The analysis results of the main branch.
 * @param prBranchAnalysis - The analysis results of the pull request branch.
 * @returns The new issues introduced by the pull request branch.
 */
export function compareAnalysisResults(
  mainBranchAnalysis: VMDAnalysis,
  prBranchAnalysis: VMDAnalysis
): VMDAnalysis {
  const newIssues: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {},
    codeHealth: prBranchAnalysis.codeHealth
  };

  for (const [file, issues] of Object.entries(prBranchAnalysis.reportOutput)) {
    filterResults(mainBranchAnalysis, file, newIssues, issues);
  }

  return newIssues;
}
