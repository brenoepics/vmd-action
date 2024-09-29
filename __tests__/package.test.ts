import { runPackage, installPackage, detectManager } from "../src/helpers/package";
import * as core from "@actions/core";
import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

jest.mock("@actions/core");
jest.mock("execa");
jest.mock("node:fs");
jest.mock("node:path");

describe("runPackage", () => {
  it("should run package with correct arguments", async () => {
    const pkgManager = "npm";
    const pkg = "vue-mess-detector";
    const args = ["analyze", "src"];

    (execa as jest.Mock).mockResolvedValue({ stdout: "output" });

    const result = await runPackage(pkgManager, pkg, args);

    expect(result).toBe("output");
    expect(execa).toHaveBeenCalledWith("npx", ["vue-mess-detector", "analyze", "src"]);
  });
});

describe("installPackage", () => {
  it("should install package with correct arguments", async () => {
    const pkgManager = "npm";
    const pkg = "vue-mess-detector@latest";

    (execa as jest.Mock).mockResolvedValue({ stdout: "installed" });

    const result = await installPackage(pkgManager, pkg);

    expect(result).toBe("installed");
    expect(execa).toHaveBeenCalledWith("npm", ["install", "-g", "vue-mess-detector@latest"]);
  });
});

describe("detectManager", () => {
  it("should detect yarn as package manager", () => {
    (fs.existsSync as jest.Mock).mockImplementation((filePath) => filePath === "yarn.lock");

    const result = detectManager();

    expect(result).toBe("yarn");
  });

  it("should detect pnpm as package manager", () => {
    (fs.existsSync as jest.Mock).mockImplementation((filePath) => filePath === "pnpm-lock.yaml");

    const result = detectManager();

    expect(result).toBe("pnpm");
  });

  it("should detect bun as package manager", () => {
    (fs.existsSync as jest.Mock).mockImplementation((filePath) => filePath === "bun.lockb");

    const result = detectManager();

    expect(result).toBe("bun");
  });

  it("should default to npm as package manager", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = detectManager();

    expect(result).toBe("npm");
  });
});
