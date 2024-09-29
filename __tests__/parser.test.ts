import { parseAnalysisOutput, compareAnalysisResults } from "../src/helpers/parser.js";
import fs from "node:fs";
import { VMDAnalysis } from "../src/types.js";
import { describe, expect, it, vi, beforeEach, Mock } from "vitest";
import * as core from "@actions/core";

vi.mock("node:fs");
vi.spyOn(core, "setFailed");

describe("parseAnalysisOutput", () => {
  const resultPath = "vmd-analysis.json";
  const mockFileContent = '{"output":[],"codeHealthOutput":[],"reportOutput":{}}';

  beforeEach(() => {
    vi.clearAllMocks();
  });


  it("should parse analysis output successfully", () => {
    (fs.readFileSync as Mock).mockReturnValue(mockFileContent);

    const result = parseAnalysisOutput(resultPath);

    expect(result).toEqual({
      output: [],
      codeHealthOutput: [],
      reportOutput: {}
    });
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  it("should handle error when parsing analysis output", () => {
    (fs.readFileSync as Mock).mockImplementation(() => {
      throw new Error("Read failed");
    });

    const result = parseAnalysisOutput(resultPath);

    expect(result).toBeUndefined();
    expect(core.setFailed).toHaveBeenCalledWith("Failed to parse analysis output: Read failed");
  });
});

describe("compareAnalysisResults", () => {
  const oldAnalysis: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {
      "file1": [{ id: "1", description: "desc1", message: "msg1" }],
      "file2": [{ id: "2", description: "desc2", message: "msg2" }]
    },
    codeHealth: {
      errors: 1,
      warnings: 2,
      linesCount: 100,
      filesCount: 2,
      points: 95
    }
  };

  const prBranchAnalysis: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {
      "file1": [{ id: "1", description: "desc1", message: "msg1" }],
      "file2": [{ id: "3", description: "desc3", message: "msg3" }]
    },
    codeHealth: {
      errors: 2,
      warnings: 3,
      linesCount: 150,
      filesCount: 3,
      points: 90
    }
  };

  it("should return new issues introduced by the pull request branch", () => {
    const result = compareAnalysisResults(oldAnalysis, prBranchAnalysis);

    expect(result).toEqual({
      output: [],
      codeHealthOutput: [],
      reportOutput: {
        "file2": [{ id: "3", description: "desc3", message: "msg3" }]
      },
      codeHealth: {
        errors: 1,
        warnings: 1,
        linesCount: 50,
        filesCount: 1,
        points: 95
      }
    });
  });

  it("should return empty new issues if codeHealth is undefined", () => {
    const prBranchAnalysisWithoutCodeHealth: VMDAnalysis = {
      ...prBranchAnalysis,
      codeHealth: undefined
    };

    const result = compareAnalysisResults(oldAnalysis, prBranchAnalysisWithoutCodeHealth);

    expect(result).toEqual({
      output: [],
      codeHealthOutput: [],
      reportOutput: {},
      codeHealth: {
        errors: 0,
        warnings: 0,
        linesCount: 0,
        filesCount: 0,
        points: 0
      }
    });
  });
});
