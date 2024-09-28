import * as github from "@actions/github";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils.js";
import { watermark } from "../templates/commentTemplate.js";

async function deleteOldComments(
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  pull_number: number
) {
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: pull_number
  });

  for (const comment of comments) {
    if (!comment.body?.startsWith(watermark)) {
      continue;
    }
    core.debug(`Deleting comment ${comment.id.toString()}`);
    await octokit.rest.issues.deleteComment({
      owner,
      repo,
      comment_id: comment.id
    });
  }
}

export async function commentOnPullRequest(commentBody: string): Promise<void> {
  if (!github.context.payload.pull_request) {
    throw new Error("No pull request found in the context!");
  }

  if (core.getInput("github-token") === "") {
    throw new Error(
      "Could not add a comment to pull request because github-token is missing!"
    );
  }

  const token: string = core.getInput("github-token");
  const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);
  const { owner, repo } = github.context.repo;
  const pull_number: number = github.context.payload.pull_request.number;

  try {
    const deleteComments: boolean = core.getBooleanInput("deleteOldComments");
    if (deleteComments) {
      await deleteOldComments(octokit, owner, repo, pull_number);
    }
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
