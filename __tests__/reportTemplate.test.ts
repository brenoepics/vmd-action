import { getReportTemplate, renderReport, renderReportsByKey } from "../src/templates/reportTemplate.js";
import { VMDAnalysis, ReportOutput } from "../src/types.js";
import { describe, expect, it } from "vitest";

describe("getReportTemplate", () => {
  const analysisOutput: VMDAnalysis = {
    output: [],
    codeHealthOutput: [],
    reportOutput: {
      "file1.ts": [
        { id: "1", description: "desc1", message: "msg1" },
        { id: "2", description: "desc2", message: "msg2" }
      ],
      "file2.ts": [
        { id: "3", description: "desc3", message: "msg3" }
      ]
    },
    codeHealth: {
      errors: 0,
      warnings: 0,
      linesCount: 100,
      filesCount: 1,
      points: 100
    }
  };

  it("should return the correct report template", () => {
    const result = getReportTemplate(analysisOutput);
    expect(result).toContain("VMD Report");
    expect(result).toContain("file1.ts");
    expect(result).toContain("file2.ts");
  });

  it("should return an empty string if report is empty", () => {
    const emptyAnalysisOutput: VMDAnalysis = {
      ...analysisOutput,
      reportOutput: {}
    };
    const result = getReportTemplate(emptyAnalysisOutput);
    expect(result).toBe("");
  });
});

describe("renderReport", () => {
  const analysisOutput: { [key: string]: ReportOutput[] | undefined } = {
    "file1.ts": [
      { id: "1", description: "desc1", message: "msg1" },
      { id: "2", description: "desc2", message: "msg2" }
    ],
    "file2.ts": [
      { id: "3", description: "desc3", message: "msg3" }
    ]
  };

  it("should return the correct rendered report", () => {
    const result = renderReport(analysisOutput);
    expect(result).toContain("file1.ts");
    expect(result).toContain("file2.ts");
    expect(result).toContain("1: msg1");
    expect(result).toContain("2: msg2");
    expect(result).toContain("3: msg3");
  });

  it("should return an empty string if analysis is empty", () => {
    const emptyAnalysisOutput: { [key: string]: ReportOutput[] | undefined } = {};
    const result = renderReport(emptyAnalysisOutput);
    expect(result).toBe("");
  });
});

describe("renderReportsByKey", () => {
  const reportOutput: ReportOutput[] = [
    { id: "1", description: "desc1", message: "msg1" },
    { id: "2", description: "desc2", message: "msg2" }
  ];

  it("should return the correct rendered reports by key", () => {
    const result = renderReportsByKey("file1.ts", reportOutput);
    expect(result).toContain("file1.ts");
    expect(result).toContain("1: msg1");
    expect(result).toContain("2: msg2");
  });

  it("should handle relative paths correctly", () => {
    const result = renderReportsByKey("/absolute/path/to/file1.ts", reportOutput);
    expect(result).toContain("file1.ts");
  });
});
