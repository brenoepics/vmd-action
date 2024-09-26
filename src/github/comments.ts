import * as github from "@actions/github";
import * as core from "@actions/core";
import { VMDAnalysis } from "../types.js";
import { GitHub } from "@actions/github/lib/utils.js";
import { getCommentTemplate } from "../templates/comment.js";

export async function commentOnPullRequest(
  analysis: VMDAnalysis,
  artifactId: number | undefined
): Promise<void> {
  if (!github.context.payload.pull_request) {
    throw new Error("No pull request found in the context!");
  }

  if (core.getInput("github-token") === "") {
    throw new Error(
      "Error: could not add a comment to pull request because github-token is missing!"
    );
  }

  const token: string = core.getInput("github-token");
  const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);
  const { owner, repo } = github.context.repo;
  const pull_number: number = github.context.payload.pull_request.number;

  try {
    const commentBody: string = getCommentTemplate(analysis, artifactId);
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: commentBody
    });
  } catch (error: unknown) {
    core.setFailed("Failed to comment on pull request");
  }
}
