/**
 * This file contains the typescript interfaces for the VMDAnalysis object
 * codeHealth is only present on vue-mess-detector >= 0.54.1
 */
export interface VMDAnalysis {
  output: CodeHealthOutputElement[];
  codeHealthOutput: CodeHealthOutputElement[];
  reportOutput: { [key: string]: ReportOutput[] | undefined };
  codeHealth?: CodeHealth;
}

export interface IssuesOutput {
  newIssues: ReportOutput[];
  fixedIssues: ReportOutput[];
}

export type relativeAnalysis = VMDAnalysis & { prCodeHealth?: PRCodeHealth } & {
  issues?: IssuesOutput;
};

export type VMDOutput = {
  relativeAnalysis?: relativeAnalysis;
  fullAnalysis: VMDAnalysis;
};

export interface PRCodeHealth {
  newErrors: number;
  newWarnings: number;
  fixedErrors: number;
  fixedWarnings: number;
  linesCount: number;
  filesCount: number;
  points: number | null;
}

export interface CodeHealth {
  errors: number;
  warnings: number;
  linesCount: number;
  filesCount: number;
  points: number | null;
}

export interface CodeHealthOutputElement {
  info: string;
}

export interface ReportOutput {
  id: string;
  description: string;
  message: string;
  level?: string;
}
