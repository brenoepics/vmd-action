import { ReportOutput, VMDAnalysis } from "../types.js";
import { getReportAsMap } from "./utils.js";

const reportBlock: string = `
<details>
  <summary>VMD Report</summary>
  
  {{outputList}}

</details>
`;

export function getReportTemplate(analysis: VMDAnalysis): string {
  const codeBlock: string = `\`\`\`\n${renderReport(analysis.reportOutput)}\n\`\`\``;
  return reportBlock.replace(/{{outputList}}/g, codeBlock);
}

export function renderReport(analysis: {
  [key: string]: ReportOutput[];
}): string {
  let outputList: string = "";
  const res: Map<string, ReportOutput[]> = getReportAsMap(analysis);

  res.forEach((value, key) => {
    outputList += renderReportsByKey(key, value);
  });

  return outputList;
}

function renderReportsByKey(key: string, value: ReportOutput[]) {
  let output: string = `- ${key}:`;
  value.forEach(report => (output += singleReport(report)));
  return output;
}

const singleReport: (report: ReportOutput) => string = (
  report: ReportOutput
): string => {
  return `\n    ${report.id}: ${report.message}`;
};
