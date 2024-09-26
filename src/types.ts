/**
 * This file contains the typescript interfaces for the VMDAnalysis object
 * codeHealth is only present on vue-mess-detector >= 0.54.1
 */
export interface VMDAnalysis {
  output: CodeHealthOutputElement[];
  codeHealthOutput: CodeHealthOutputElement[];
  reportOutput: { [key: string]: ReportOutput[] };
  codeHealth?: CodeHealth;
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
