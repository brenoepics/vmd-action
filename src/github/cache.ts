import * as core from "@actions/core";
import * as cache from "@actions/cache";
import { VMDAnalysis } from "../types.js";
import { parseAnalysisOutput } from "../helpers/parser.js";

export async function saveCache(
  filePath: string,
  branch: string
): Promise<void> {
  const cacheId: string = `vmd-analysis-${branch}`;
  const cachePaths: string[] = [filePath];
  try {
    await cache.saveCache(cachePaths, cacheId);
  } catch (error) {
    core.warning(`Failed to save cache: ${(error as Error).message}`);
  }
}

export async function restoreCache(
  branch: string,
  cachePath: string
): Promise<VMDAnalysis | undefined> {
  const cacheId: string = `vmd-analysis-${branch}`;
  try {
    const cacheKey: string | undefined = await cache.restoreCache(
      [cachePath],
      cacheId
    );
    if (cacheKey) {
      return parseAnalysisOutput(cachePath);
    }
  } catch (error) {
    core.warning(`Failed to restore cache: ${(error as Error).message}`);
  }
  return undefined;
}
