import {
  CodeHealth,
  PRCodeHealth,
  ReportOutput,
  VMDAnalysis
} from "../types.js";
import * as github from "@actions/github";
import { artifactText } from "./commentTemplate.js";
import { Context } from "@actions/github/lib/context.js";

export function getReportAsMap(report: {
  [p: string]: ReportOutput[] | undefined;
}): Map<string, ReportOutput[]> {
  const reportOutputMap: Map<string, ReportOutput[]> = new Map<
    string,
    ReportOutput[]
  >();

  for (const [parent, outputs] of Object.entries(report)) {
    if (outputs) {
      reportOutputMap.set(parent, outputs);
    }
  }

  return reportOutputMap;
}

export function getCoverageInfo(result: VMDAnalysis): string {
  return result.codeHealthOutput.map(element => element.info).join("\n");
}

function replacePlaceholders(
  message: string,
  data: PRCodeHealth | CodeHealth
): string {
  for (const [key, value] of Object.entries(data)) {
    const regex: RegExp = new RegExp(`{{${key}}}`, "g");
    message = message.replace(regex, String(value));
  }
  return message;
}

export function replaceCodeHealth(
  message: string,
  health: PRCodeHealth | CodeHealth | undefined,
  template: string
): string {
  if (!health) {
    return message.replace(/{{coverageInfo}}/g, "No health data available");
  }
  message = message.replace(/{{coverageInfo}}/g, template);
  return replacePlaceholders(message, health);
}

export function replaceRepoData(
  message: string,
  artifactId: number | undefined
): string {
  const context: Context = github.context;
  return message
    .replace(/{{serverUrl}}/g, context.serverUrl)
    .replace(/{{runId}}/g, context.runId.toString())
    .replace(/{{repositoryName}}/g, context.repo.repo)
    .replace(/{{repositoryOwner}}/g, context.repo.owner)
    .replace(/{{artifactText}}/g, artifactId ? artifactText : "")
    .replace(/{{artifactId}}/g, String(artifactId ?? 0));
}

export function replaceBadges(message: string, badges: string[]): string {
  return message.replace(/{{coverageBadge}}/g, badges.join(" "));
}
