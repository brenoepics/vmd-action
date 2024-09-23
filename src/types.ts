export interface VMDAnalysis {
  output: CodeHealthOutputElement[];
  codeHealthOutput: CodeHealthOutputElement[];
  reportOutput: { [key: string]: ReportOutput[] };
}

export interface CodeHealthOutputElement {
  info: string;
}

export interface ReportOutput {
  id: string;
  description: string;
  message: string;
}
