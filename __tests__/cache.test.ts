import * as core from "@actions/core";
import * as cache from "@actions/cache";
import { saveCache, restoreCache } from "../src/github/cache";
import { VMDAnalysis } from "../src/types";
import { parseAnalysisOutput } from "../src/helpers/parser";

jest.mock("@actions/core");
jest.mock("@actions/cache");
jest.mock("../src/helpers/parser");

describe("saveCache", () => {
  const filePath = "vmd-analysis.json";
  const branch = "main";
  const cacheId = `vmd-analysis-${branch}`;
  const cachePaths = [filePath];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save cache successfully", async () => {
    await saveCache(filePath, branch);

    expect(cache.saveCache).toHaveBeenCalledWith(cachePaths, cacheId);
  });

  it("should handle error when saving cache", async () => {
    (cache.saveCache as jest.Mock).mockRejectedValue(new Error("Save failed"));

    await saveCache(filePath, branch);

    expect(core.warning).toHaveBeenCalledWith("Failed to save cache: Save failed");
  });
});

describe("restoreCache", () => {
  const branch = "main";
  const cacheId = `vmd-analysis-${branch}`;
  const cachePaths = ["vmd-analysis.json"];
  const mockAnalysisOutput: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {},
    codeHealth: undefined
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should restore cache successfully", async () => {
    (cache.restoreCache as jest.Mock).mockResolvedValue(cacheId);
    (parseAnalysisOutput as jest.Mock).mockReturnValue(mockAnalysisOutput);

    const result = await restoreCache(branch);

    expect(result).toEqual(mockAnalysisOutput);
    expect(cache.restoreCache).toHaveBeenCalledWith(cachePaths, cacheId);
    expect(parseAnalysisOutput).toHaveBeenCalledWith("vmd-analysis.json");
  });

  it("should handle error when restoring cache", async () => {
    (cache.restoreCache as jest.Mock).mockRejectedValue(new Error("Restore failed"));

    const result = await restoreCache(branch);

    expect(result).toBeUndefined();
    expect(core.warning).toHaveBeenCalledWith("Failed to restore cache: Restore failed");
  });

  it("should return undefined if cache key is not found", async () => {
    (cache.restoreCache as jest.Mock).mockResolvedValue(undefined);

    const result = await restoreCache(branch);

    expect(result).toBeUndefined();
    expect(parseAnalysisOutput).not.toHaveBeenCalled();
  });
});
