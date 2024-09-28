import { UploadArtifactResponse } from "@actions/artifact/lib/internal/shared/interfaces.js";
import * as core from "@actions/core";
import {
  ArtifactClient,
  DefaultArtifactClient
} from "@actions/artifact/lib/internal/client.js";

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
