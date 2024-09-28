import * as core from "@actions/core";

export async function runGroup(
  groupName: string,
  fn: () => Promise<void>
): Promise<void> {
  core.startGroup(groupName);
  try {
    await fn();
  } finally {
    core.endGroup();
  }
}
