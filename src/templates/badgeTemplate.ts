import * as core from "@actions/core";
import {
  LOW_HEALTH_THRESHOLD,
  MEDIUM_HEALTH_THRESHOLD,
  OK_HEALTH_THRESHOLD
} from "../utils/constants.js";

const baseUrl: string = "https://img.shields.io/badge/";

export type BadgeStyle =
  | "flat"
  | "plastic"
  | "flat-square"
  | "for-the-badge"
  | "social";

interface BadgeOptions {
  text: string;
  style: BadgeStyle;
  label: string;
  labelColor: string;
  color: string;
}

export function buildBadgeUrl({
  text,
  style,
  label,
  labelColor,
  color
}: BadgeOptions): string {
  text = encodeURIComponent(text);
  return `${baseUrl}${text}-${text}?style=${style}&label=${encodeURIComponent(label)}&labelColor=${labelColor}&color=${color}`;
}

function getHealthColor(percentage: number) {
  if (percentage < LOW_HEALTH_THRESHOLD) {
    return "#ff0000";
  }
  if (percentage < MEDIUM_HEALTH_THRESHOLD) {
    return "#ffbf00";
  }
  if (percentage < OK_HEALTH_THRESHOLD) {
    return "#007ec6";
  }
  return "#21c542";
}

export function getCoverageBadge(
  percentage: number | undefined | string
): string {
  let color: string = "blue";
  const label: string = "Code Health";

  if (percentage === undefined) {
    percentage = "N/A";
    color = "#8c8c8c";
    core.warning(
      "No code health data found in the analysis output! you may need to update vue-mess-detector to >= 0.54.1"
    );
  }

  if (typeof percentage === "number") {
    color = getHealthColor(percentage);
  }

  const badgeUrl: string = buildBadgeUrl({
    text: `${percentage.toString()}%`,
    style: "flat",
    label,
    labelColor: "8A2BE2",
    color
  });

  return `![${label}](${badgeUrl})`;
}
