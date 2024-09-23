import { UploadArtifactResponse } from "@actions/artifact/lib/internal/shared/interfaces.js";
import * as core from "@actions/core";
import {
  ArtifactClient,
  DefaultArtifactClient
} from "@actions/artifact/lib/internal/client.js";

function generateArtifactName() {
  const randomHash: string = Math.random().toString(36).substring(2, 10);
  const timestamp: number = Date.now();
  return `vmd-report-${randomHash}-${timestamp.toString()}`;
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
