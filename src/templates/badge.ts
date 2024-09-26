import * as core from "@actions/core";

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
  return `${baseUrl}${text}-${text}?style=${style}&label=${encodeURIComponent(label)}&labelColor=${labelColor}&color=${color}`;
}

export function getCoverageBadge(
  percentage: number | undefined | string
): string {
  let color: string = "blue";
  const label: string = "Code Health";

  if (percentage === undefined) {
    percentage = "N/A";
    color = "lightgrey";
    core.warning(
      "No code health data found in the analysis output! you may need to update vue-mess-detector to >= 0.54.1"
    );
  }

  if (typeof percentage === "number") {
    if (percentage < 40) {
      color = "red";
    } else if (percentage < 70) {
      color = "yellow";
    } else {
      color = "green";
    }
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
