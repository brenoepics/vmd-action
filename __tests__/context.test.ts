import { PAYLOAD, IS_PULL_REQUEST, CURRENT_BRANCH, TARGET_BRANCH } from "../src/github/context";
import * as github from "@actions/github";

describe("PAYLOAD", () => {
  it("should return the GitHub context payload", () => {
    expect(PAYLOAD).toEqual(github.context.payload);
  });
});

describe("IS_PULL_REQUEST", () => {
  it("should return true if the payload contains a pull request", () => {
    github.context.payload = { pull_request: {number: 1} };
    expect(IS_PULL_REQUEST).toBe(true);
  });

  it("should return false if the payload does not contain a pull request", () => {
    github.context.payload = {};
    expect(IS_PULL_REQUEST).toBe(false);
  });
});

describe("CURRENT_BRANCH", () => {
  it("should return the current branch name", () => {
    github.context.ref = "refs/heads/main";
    expect(CURRENT_BRANCH).toBe("main");
  });
});

describe("TARGET_BRANCH", () => {
  it("should return the target branch name if the payload contains a pull request", () => {
    github.context.payload = { pull_request: { number: 1, base: { ref: "main" } } };
    expect(TARGET_BRANCH).toBe("main");
  });

  it("should return undefined if the payload does not contain a pull request", () => {
    github.context.payload = {};
    expect(TARGET_BRANCH).toBeUndefined();
  });
});
