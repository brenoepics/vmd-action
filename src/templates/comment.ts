import { CodeHealthOutputElement } from "../types.js";
import * as github from "@actions/github";

const comment: string = `
## 🎉 Vue Mess Detector Analysis Results 🎉

📊 **Coverage Information:**

{{coverageInfo}}
{{artifactText}}

_For any issues, please report them [here](https://github.com/TODO/TODO/issues) 🐞._
`;

const artifactText: string = `
🚀 The detailed coverage report has been successfully uploaded! You can access it [here](../actions/runs/{{runId}}/artifacts/{{artifactId}}) 🔗.
`;

/**
 * TODO: this is a tweak to remove the progress,in the future would be great to have a fully parsed errors, warns... message.
 *
 */
export function getCommentTemplate(
  codeHealthOutput: CodeHealthOutputElement[],
  artifactId: number | undefined
): string {
  const coverageInfo: string = codeHealthOutput
    .filter((_, index) => index !== 1) // Skip the progress element (index 1)
    .map(element => element.info)
    .join("\n");

  return comment
    .replace(/{{coverageInfo}}/g, coverageInfo)
    .replace(/{{artifactText}}/g, artifactId ? artifactText : "")
    .replace(/{{artifactId}}/g, String(artifactId ?? 0))
    .replace(/{{runId}}/g, github.context.runId.toString())
    .replace(/{{repository/g, github.context.repo.repo)
    .replace(/{{repositoryOwner/g, github.context.repo.owner);
}
