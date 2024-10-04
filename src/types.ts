/**
 * This file contains the typescript interfaces for the VMDAnalysis object
 * codeHealth is only present on vue-mess-detector >= 0.54.1
 */

export type VMDReportList = { [key: string]: ReportOutput[] | undefined };
export interface VMDAnalysis {
  output: CodeHealthOutputElement[];
  codeHealthOutput: CodeHealthOutputElement[];
  reportOutput: VMDReportList;
  codeHealth?: CodeHealth;
}

export type IssuesOutput = {
  newIssues: VMDReportList;
  fixedIssues: VMDReportList;
};

export type relativeAnalysis = { prCodeHealth?: PRCodeHealth } & {
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
