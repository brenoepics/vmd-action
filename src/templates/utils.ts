import { CodeHealth, ReportOutput, VMDAnalysis } from "../types.js";
import * as github from "@actions/github";
import { artifactText, coverageInfo } from "./commentTemplate.js";
import { getCoverageBadge } from "./badgeTemplate.js";

export function getReportAsMap(report: {
  [key: string]: ReportOutput[];
}): Map<string, ReportOutput[]> {
  const reportOutputMap: Map<string, ReportOutput[]> = new Map<
    string,
    ReportOutput[]
  >();

  for (const [parent, outputs] of Object.entries(report)) {
    reportOutputMap.set(parent, outputs);
  }

  return reportOutputMap;
}

export function getCoverageInfo(result: VMDAnalysis): string {
  return result.codeHealthOutput.map(element => element.info).join("\n");
}

export function replaceCodeHealth(message: string, health: CodeHealth): string {
  return message
    .replace(/{{coverageInfo}}/g, coverageInfo)
    .replace(/{{errors}}/g, health.errors.toLocaleString())
    .replace(/{{warnings}}/g, health.warnings.toLocaleString())
    .replace(/{{linesCount}}/g, health.linesCount.toLocaleString())
    .replace(/{{filesCount}}/g, health.filesCount.toLocaleString())
    .replace(/{{points}}/g, health.points ? health.points.toString() : "0");
}

export function replaceRepoData(
  message: string,
  artifactId: number | undefined
): string {
  return message
    .replace(/{{artifactText}}/g, artifactId ? artifactText : "")
    .replace(/{{artifactId}}/g, String(artifactId ?? 0))
    .replace(/{{runId}}/g, github.context.runId.toString())
    .replace(/{{repository/g, github.context.repo.repo)
    .replace(/{{repositoryOwner/g, github.context.repo.owner);
}

export function replaceBadges(message: string, result: VMDAnalysis): string {
  return message.replace(
    /{{coverageBadge}}/g,
    getCoverageBadge(result.codeHealth?.points)
  );
}
