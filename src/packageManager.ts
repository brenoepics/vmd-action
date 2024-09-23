import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";
import * as core from "@actions/core";

export async function runPackage(
  pkgManager: string,
  pkg: string,
  args: string[]
): Promise<string> {
  const runCommand: string = runCmd(pkgManager);
  core.info(`Running ${pkg} with ${runCommand}`);
  const { stdout } = await execa(runCommand, [pkg, ...args]);
  return stdout;
}

export async function installPackage(
  pkgManager: string,
  pkg: string
): Promise<string> {
  const installCommand: string = installCmd(pkgManager);
  core.info(`Installing ${pkg} with ${pkgManager}`);
  const { stdout } = await execa(pkgManager, [
    ...installCommand.split(" "),
    pkg
  ]);
  return stdout;
}

export function detectManager(): string {
  if (fs.existsSync(path.resolve("yarn.lock"))) {
    return "yarn";
  }

  if (fs.existsSync(path.resolve("pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.resolve("bun.lockb"))) {
    return "bun";
  }

  return "npm";
}

const installCmd: (pkgManager: string) => string = function (
  pkgManager: string
): string {
  switch (pkgManager) {
    case "yarn":
      return "add";
    case "pnpm":
      return "add -g";
    case "bun":
      return "add -g";
    default:
      return "install -g";
  }
};

const runCmd: (pkgManager: string) => string = function (
  pkgManager: string
): string {
  switch (pkgManager) {
    case "yarn":
      return "yarn";
    case "pnpm":
      return "pnpm";
    case "bun":
      return "bunx";
    default:
      return "npx";
  }
};
