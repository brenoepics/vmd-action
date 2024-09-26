import { CodeHealth, VMDAnalysis } from "../types.js";
import * as github from "@actions/github";
import { getCoverageBadge } from "./badge.js";

const comment: string = `
## 📊 Vue Mess Detector Analysis Results

#### Code Health: {{coverageBadge}}
{{coverageInfo}}
{{artifactText}}

###### For any issues, please [report them here](https://github.com/brenoepics/vmd-action/issues/).
`;

const coverageInfo: string = `
Errors: {{errors}}
Warnings: {{warnings}}
Total Lines: {{linesCount}}
Total Files: {{filesCount}}
`;

const artifactText: string = `
[See analysis details here](../actions/runs/{{runId}}/artifacts/{{artifactId}})
`;

function getCoverageInfo(result: VMDAnalysis) {
  return result.codeHealthOutput.map(element => element.info).join("\n");
}

function replaceCodeHealth(message: string, health: CodeHealth) {
  return message
    .replace(/{{coverageInfo}}/g, coverageInfo)
    .replace(/{{errors}}/g, health.errors.toString())
    .replace(/{{warnings}}/g, health.warnings.toString())
    .replace(/{{linesCount}}/g, health.linesCount.toString())
    .replace(/{{filesCount}}/g, health.filesCount.toString())
    .replace(/{{points}}/g, health.points.toString());
}

function replaceRepoData(message: string, artifactId: number | undefined) {
  return message
    .replace(/{{artifactText}}/g, artifactId ? artifactText : "")
    .replace(/{{artifactId}}/g, String(artifactId ?? 0))
    .replace(/{{runId}}/g, github.context.runId.toString())
    .replace(/{{repository/g, github.context.repo.repo)
    .replace(/{{repositoryOwner/g, github.context.repo.owner);
}

function replaceBadges(message: string, result: VMDAnalysis) {
  return message.replace(
    /{{coverageBadge}}/g,
    getCoverageBadge(result.codeHealth?.points)
  );
}

export function getCommentTemplate(
  result: VMDAnalysis,
  artifactId: number | undefined
): string {
  let message: string = replaceRepoData(comment, artifactId);
  if (result.codeHealth) {
    message = replaceCodeHealth(message, result.codeHealth);
  } else {
    message = message.replace(/{{coverageInfo}}/g, getCoverageInfo(result));
  }

  message = replaceBadges(message, result);
  return message;
}
