import { VMDOutput } from "../types.js";
import { replaceBadges, replaceCodeHealth, replaceRepoData } from "./utils.js";
import { getReportTemplate } from "./reportTemplate.js";
import { getHealthBadges } from "./badgeTemplate.js";

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

export const newCoverageInfo: string = `
🚨 New Errors: {{newErrors}}
⚠️ New Warnings: {{newWarnings}}
✅ Fixed Errors: {{fixedErrors}}
🔧 Fixed Warnings: {{fixedWarnings}}
📝 Total Lines: {{linesCount}}
📁 Total Files: {{filesCount}}
`;

export const artifactText: string = `
🔍 [Download Full Analysis Details](https://github.com/{{repositoryOwner}}/{{repository}}/actions/runs/{{runId}}/artifacts/{{artifactId}})
`;

export function getCommentTemplate(
  result: VMDOutput,
  artifactId: number | undefined
): string {
  const coverageTemplate: string = result.relativeAnalysis
    ? newCoverageInfo
    : coverageInfo;
  let message: string = replaceRepoData(commentTemplate, artifactId);
  if (result.relativeAnalysis) {
    message = replaceCodeHealth(
      message,
      result.relativeAnalysis.prCodeHealth,
      coverageTemplate
    );
    message = replaceBadges(message, getHealthBadges(result));
    message = message.replace(
      /{{reportBlock}}/g,
      getReportTemplate(result.relativeAnalysis)
    );
    return message;
  }

  message = replaceCodeHealth(
    message,
    result.fullAnalysis.codeHealth,
    coverageTemplate
  );
  message = replaceBadges(message, getHealthBadges(result));
  message = message.replace(
    /{{reportBlock}}/g,
    getReportTemplate(result.fullAnalysis)
  );
  return message;
}
