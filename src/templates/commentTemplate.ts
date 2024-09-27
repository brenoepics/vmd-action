import { VMDAnalysis } from "../types.js";
import {
  getCoverageInfo,
  replaceBadges,
  replaceCodeHealth,
  replaceRepoData
} from "./utils.js";
import { getReportTemplate } from "./reportTemplate.js";

export const watermark: string = `<!-- VMD Analysis Comment -->`;

const commentTemplate: string = `${watermark}
## 📊 Vue Mess Detector Analysis Results

#### {{coverageBadge}}
{{coverageInfo}}

{{reportBlock}}
{{artifactText}}

###### For any issues or feedback, feel free to [report them here](https://github.com/brenoepics/vmd-action/issues/).
`;

export const coverageInfo: string = `
🚨 Errors: {{errors}}
⚠️ Warnings: {{warnings}}
📝 Total Lines: {{linesCount}}
📁 Total Files: {{filesCount}}
`;

export const artifactText: string = `
🔍 [View Full Analysis Details](../actions/runs/{{runId}}/artifacts/{{artifactId}})
`;

export function getCommentTemplate(
  result: VMDAnalysis,
  artifactId: number | undefined
): string {
  let message: string = replaceRepoData(commentTemplate, artifactId);
  if (result.codeHealth) {
    message = replaceCodeHealth(message, result.codeHealth);
  } else {
    message = message.replace(/{{coverageInfo}}/g, getCoverageInfo(result));
  }

  message = replaceBadges(message, result);
  message = message.replace(/{{reportBlock}}/g, getReportTemplate(result));
  return message;
}
