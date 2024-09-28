import { UploadArtifactResponse } from "@actions/artifact/lib/internal/shared/interfaces.js";
import * as core from "@actions/core";
import {
  ArtifactClient,
  DefaultArtifactClient
} from "@actions/artifact/lib/internal/client.js";
import * as cache from "@actions/cache";
import fs from "fs";
import { VMDAnalysis } from "../types.js";
import { parseAnalysisOutput } from "../helpers/parser.js";

function generateArtifactName(): string {
  const prefix: string = "vmd-report";
  const randomHash: string = Math.floor(Math.random() * 1e8).toString();
  const timestamp: string = Date.now().toString();
  return `${prefix}-${randomHash}-${timestamp}`;
}

export async function uploadOutputArtifact(
  coverageFilePath: string
): Promise<number | undefined> {
  let artifactId: number | undefined;

  try {
    const artifact: UploadArtifactResponse = await uploadCoverageArtifact(
      coverageFilePath,
      generateArtifactName()
    );
    artifactId = artifact.id;
  } catch (error: unknown) {
    core.error("Failed to upload artifact!");
    core.setFailed(error as Error);
  }

  return artifactId;
}

async function uploadCoverageArtifact(
  filePath: string,
  artifactName: string
): Promise<UploadArtifactResponse> {
  const artifactClient: ArtifactClient = new DefaultArtifactClient();
  const files: string[] = [filePath];
  const rootDirectory: string = process.cwd();
  return await artifactClient.uploadArtifact(
    artifactName,
    files,
    rootDirectory
  );
}

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
