import { uploadOutputArtifact } from "../src/github/artifact";
import * as core from "@actions/core";
import { UploadArtifactResponse } from "@actions/artifact/lib/internal/shared/interfaces";
import { ArtifactClient, DefaultArtifactClient } from "@actions/artifact/lib/internal/client";

jest.mock("@actions/core");
jest.mock("@actions/artifact/lib/internal/client");

describe("uploadOutputArtifact", () => {
  const mockUploadArtifactResponse: UploadArtifactResponse = {
    size: 123,
    id: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload artifact and return artifact id", async () => {
    (DefaultArtifactClient.prototype.uploadArtifact as jest.Mock).mockResolvedValue(mockUploadArtifactResponse);

    const artifactId = await uploadOutputArtifact("coverageFilePath");

    expect(artifactId).toBe(1);
    expect(DefaultArtifactClient.prototype.uploadArtifact).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.any(String)
    );
  });

  it("should handle error and return undefined", async () => {
    (DefaultArtifactClient.prototype.uploadArtifact as jest.Mock).mockRejectedValue(new Error("Upload failed"));

    const artifactId = await uploadOutputArtifact("coverageFilePath");

    expect(artifactId).toBeUndefined();
    expect(core.error).toHaveBeenCalledWith("Failed to upload artifact!");
    expect(core.setFailed).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("uploadCoverageArtifact", () => {
  const mockUploadArtifactResponse: UploadArtifactResponse = {
    size: 123,
    id: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upload coverage artifact and return response", async () => {
    (DefaultArtifactClient.prototype.uploadArtifact as jest.Mock).mockResolvedValue(mockUploadArtifactResponse);

    const response = await uploadCoverageArtifact("filePath", "artifactName");

    expect(response).toEqual(mockUploadArtifactResponse);
    expect(DefaultArtifactClient.prototype.uploadArtifact).toHaveBeenCalledWith(
      "artifactName",
      ["filePath"],
      process.cwd()
    );
  });

  it("should handle error and throw", async () => {
    (DefaultArtifactClient.prototype.uploadArtifact as jest.Mock).mockRejectedValue(new Error("Upload failed"));

    await expect(uploadCoverageArtifact("filePath", "artifactName")).rejects.toThrow("Upload failed");
  });
});
