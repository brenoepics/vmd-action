import { CodeHealth } from "../types.js";

export const ERROR_WEIGHT: number = 1.5;
export const LOW_HEALTH_THRESHOLD: number = 75;
export const MEDIUM_HEALTH_THRESHOLD: number = 85;
export const OK_HEALTH_THRESHOLD: number = 95;

export const REPORT_PATH: string = "vmd-analysis.json";
export const EMPTY_REPORT: CodeHealth = {
  errors: 0,
  warnings: 0,
  linesCount: 0,
  filesCount: 0,
  points: 0
};
