import * as github from "@actions/github";
import { commentOnPullRequest } from "../src/github/comments.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@actions/github");

describe("commentOnPullRequest", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    github.context.payload = { pull_request: { number: 1 } };
    process.env.GITHUB_REPOSITORY = "owner/repo";
  });

  it("should throw an error if no pull request found", async () => {
    github.context.payload = {};

    await expect(commentOnPullRequest("Test comment")).rejects.toThrow(
      "No pull request found in the context!"
    );
  });

  it("should throw an error if github-token is missing", async () => {
    await expect(commentOnPullRequest("Test comment", "")).rejects.toThrow(
      "Could not add a comment to pull request because github-token is missing!"
    );
  });
});
