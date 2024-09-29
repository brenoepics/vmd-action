import { getCommentTemplate, watermark } from "../src/templates/commentTemplate.js";
import { VMDAnalysis } from "../src/types.js";
import { describe, expect, it } from "vitest";

process.env.GITHUB_REPOSITORY = "brenoepics/vmd-action";

describe("getCommentTemplate", () => {
  const analysisOutput: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {},
    codeHealth: {
      errors: 0,
      warnings: 0,
      linesCount: 100,
      filesCount: 1,
      points: 100
    }
  };

  it("should return the correct comment template with artifact", () => {
    const artifactId = 1;
    const result = getCommentTemplate(analysisOutput, artifactId);
    expect(result).toContain(watermark);
    expect(result).toContain("Vue Mess Detector Analysis Results");
    expect(result).toContain("Download Full Analysis Details");
  });

  it("should return the correct comment template without artifact", () => {
    const artifactId = undefined;
    const result = getCommentTemplate(analysisOutput, artifactId);
    expect(result).toContain(watermark);
    expect(result).toContain("Vue Mess Detector Analysis Results");
    expect(result).not.toContain("Download Full Analysis Details");
  });

  it("should return the correct comment template with relative mode", () => {
    const artifactId = 1;
    const result = getCommentTemplate(analysisOutput, artifactId, true);
    expect(result).toContain(watermark);
    expect(result).toContain("Vue Mess Detector Analysis Results");
    expect(result).toContain("New Errors");
    expect(result).toContain("New Warnings");
  });
});
