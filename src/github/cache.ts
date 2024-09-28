import * as cache from "@actions/cache";
import * as core from "@actions/core";
import fs from "fs";
import { VMDAnalysis } from "../types.js";
import { parseAnalysisOutput } from "../helpers/parser.js";

export async function saveCache(filePath: string, branch: string): Promise<void> {
  const cacheId = `vmd-analysis-${branch}`;
  const cachePaths = [filePath];
  try {
    await cache.saveCache(cachePaths, cacheId);
  } catch (error) {
    core.warning(`Failed to save cache: ${(error as Error).message}`);
  }
}

export async function restoreCache(branch: string): Promise<VMDAnalysis | undefined> {
  const cacheId = `vmd-analysis-${branch}`;
  const cachePaths = ["vmd-analysis.json"];
  try {
    const cacheKey = await cache.restoreCache(cachePaths, cacheId);
    if (cacheKey) {
      const analysisOutput: VMDAnalysis | undefined = parseAnalysisOutput("vmd-analysis.json");
      return analysisOutput;
    }
  } catch (error) {
    core.warning(`Failed to restore cache: ${(error as Error).message}`);
  }
  return undefined;
}
