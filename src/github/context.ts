/* eslint-disable @typescript-eslint/typedef,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import * as github from "@actions/github";

export const pr = github.context.payload.pull_request;
export const sourceBranch: string = pr?.head.ref.replace("refs/heads/", "");
export const targetBranch: string = pr?.base.ref.replace("refs/heads/", "");
export const isBaseBranch: boolean =
  github.context.ref === `refs/heads/${targetBranch}`;
export const isFork: boolean = pr?.head.repo.fork ?? true;
export const baseBranch: string =
  github.context.payload.pull_request?.base.ref.replace("refs/heads/", "");
