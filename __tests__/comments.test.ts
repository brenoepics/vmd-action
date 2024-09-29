import * as github from "@actions/github";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils.js";
import { commentOnPullRequest, deleteOldComments } from "../src/github/comments.js";
import { watermark } from "../src/templates/commentTemplate.js";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

vi.mock("@actions/github");
vi.mock("@actions/core");

describe("deleteOldComments", () => {
  const mockOctokit = {
    rest: {
      issues: {
        listComments: vi.fn(),
        deleteComment: vi.fn()
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(core, "summary", {
      value: { addRaw: vi.fn(), write: vi.fn() },
      writable: true,
      configurable: true
    });
  });


  it("should delete old comments with watermark", async () => {
    const comments = [
      { id: 1, body: `${watermark} Old comment` },
      { id: 2, body: "Some other comment" }
    ];
    (mockOctokit.rest.issues.listComments as Mock).mockResolvedValue({
      data: comments
    });

    await deleteOldComments(
      mockOctokit as unknown as InstanceType<typeof GitHub>,
      "owner",
      "repo",
      1
    );

    expect(mockOctokit.rest.issues.deleteComment).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      comment_id: 1
    });
    expect(mockOctokit.rest.issues.deleteComment).not.toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      comment_id: 2
    });
  });

  it("should not delete comments without watermark", async () => {
    const comments = [
      { id: 1, body: "Some other comment" },
      { id: 2, body: "Another comment" }
    ];
    (mockOctokit.rest.issues.listComments as Mock).mockResolvedValue({
      data: comments
    });

    await deleteOldComments(
      mockOctokit as unknown as InstanceType<typeof GitHub>,
      "owner",
      "repo",
      1
    );

    expect(mockOctokit.rest.issues.deleteComment).not.toHaveBeenCalled();
  });
});

describe("commentOnPullRequest", () => {
  const mockOctokit = {
    rest: {
      issues: {
        createComment: vi.fn()
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (github.getOctokit as Mock).mockReturnValue(mockOctokit);
    (core.getInput as Mock).mockReturnValue("token");
    github.context.payload = { pull_request: { number: 1 } };
    Object.defineProperty(core, "summary", {
      value: { addRaw: vi.fn(), write: vi.fn() },
      writable: true,
      configurable: true
    });
    Object.defineProperty(github.context, "repo", {
      value: { owner: "owner", repo: "repo" },
      writable: true
    });
  });

  it("should create a comment on pull request", async () => {
    await commentOnPullRequest("Test comment");

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      issue_number: 1,
      body: "Test comment"
    });
  });

  it("should throw an error if no pull request found", async () => {
    github.context.payload = {};

    await expect(commentOnPullRequest("Test comment")).rejects.toThrow(
      "No pull request found in the context!"
    );
  });

  it("should throw an error if github-token is missing", async () => {
    (core.getInput as Mock).mockReturnValue("");

    await expect(commentOnPullRequest("Test comment")).rejects.toThrow(
      "Could not add a comment to pull request because github-token is missing!"
    );
  });
});
