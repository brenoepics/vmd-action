import { ReportOutput, VMDReportList } from "../types.js";
import { getReportAsMap } from "./utils.js";
import path from "node:path";

const reportBlock: string = `
<details>
  <summary>{{summary}}</summary>
  
  {{outputList}}

</details>
`;

export function getReportTemplate(
  summary: string,
  reportOutput: VMDReportList
): string {
  const report: string = renderReport(reportOutput);
  if (report === "") {
    return "";
  }
  const codeBlock: string = `\`\`\`\n${renderReport(reportOutput)}\n\`\`\``;
  return reportBlock
    .replace(/{{outputList}}/g, codeBlock)
    .replace(/{{summary}}/g, summary);
}

function renderReport(analysis: VMDReportList): string {
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
