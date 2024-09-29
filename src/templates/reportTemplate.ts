import { ReportOutput, VMDAnalysis } from "../types.js";
import { getReportAsMap } from "./utils.js";
import path from "node:path";

const reportBlock: string = `
<details>
  <summary>VMD Report</summary>
  
  {{outputList}}

</details>
`;

export function getReportTemplate(analysis: VMDAnalysis): string {
  const report: string = renderReport(analysis.reportOutput);
  if (report === "") {
    return "";
  }
  const codeBlock: string = `\`\`\`\n${renderReport(analysis.reportOutput)}\n\`\`\``;
  return reportBlock.replace(/{{outputList}}/g, codeBlock);
}

export function renderReport(analysis: {
  [p: string]: ReportOutput[] | undefined;
}): string {
  let outputList: string = "";
  const res: Map<string, ReportOutput[]> = getReportAsMap(analysis);

  res.forEach((value, key) => {
    outputList += renderReportsByKey(key, value);
  });

  return outputList;
}

function isPath(key: string): boolean {
  return path.isAbsolute(key) || key.includes(path.sep);
}

export function renderReportsByKey(key: string, value: ReportOutput[]): string {
  if (isPath(key)) {
    key = path.relative(process.cwd(), key);
  }
  let output: string = `\n- ${key}:`;
  value.forEach(report => (output += singleReport(report)));
  return output;
}

const singleReport: (report: ReportOutput) => string = (
  report: ReportOutput
): string => {
  if (isPath(report.id)) {
    report.id = path.relative(process.cwd(), report.id);
  }
  return `\n    ${report.id}: ${report.message}`;
};
