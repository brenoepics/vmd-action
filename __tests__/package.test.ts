import { runPackage, installPackage, detectManager } from "../src/helpers/package.js";
import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, Mock, vi, beforeEach } from "vitest";

vi.mock("execa");
vi.mock("node:fs");
vi.mock("node:path");

describe("runPackage", () => {
  it("should run package with correct arguments", async () => {
    const pkgManager = "npm";
    const pkg = "vue-mess-detector";
    const args = ["analyze", "src"];

    (execa as Mock).mockResolvedValue({ stdout: "output" });

    const result = await runPackage(pkgManager, pkg, args);

    expect(result).toBe("output");
    expect(execa).toHaveBeenCalledWith("npx", ["vue-mess-detector", "analyze", "src"]);
  });
});

describe("installPackage", () => {
  it("should install package with correct arguments", async () => {
    const pkgManager = "npm";
    const pkg = "vue-mess-detector@latest";

    (execa as Mock).mockResolvedValue({ stdout: "installed" });

    const result = await installPackage(pkgManager, pkg);

    expect(result).toBe("installed");
    expect(execa).toHaveBeenCalledWith("npm", ["install", "-g", "vue-mess-detector@latest"]);
  });
});

describe("detectManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect yarn as package manager", () => {
    (path.resolve as Mock).mockImplementation((filePath) => filePath);
    (fs.existsSync as Mock).mockImplementation((filePath) => filePath === "yarn.lock");

    const result = detectManager();

    expect(result).toBe("yarn");
  });

  it("should detect pnpm as package manager", () => {
    (path.resolve as Mock).mockImplementation((filePath) => filePath);
    (fs.existsSync as Mock).mockImplementation((filePath) => filePath === "pnpm-lock.yaml");

    const result = detectManager();

    expect(result).toBe("pnpm");
  });

  it("should detect bun as package manager", () => {
    (path.resolve as Mock).mockImplementation((filePath) => filePath);
    (fs.existsSync as Mock).mockImplementation((filePath) => filePath === "bun.lockb");

    const result = detectManager();

    expect(result).toBe("bun");
  });

  it("should default to npm as package manager", () => {
    (path.resolve as Mock).mockImplementation((filePath) => filePath);
    (fs.existsSync as Mock).mockReturnValue(false);

    const result = detectManager();

    expect(result).toBe("npm");
  });
});
