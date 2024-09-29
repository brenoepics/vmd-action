import * as github from "@actions/github";
import { WebhookPayload } from "@actions/github/lib/interfaces.js";

export const PAYLOAD: WebhookPayload = github.context.payload;
export const IS_PULL_REQUEST: boolean = PAYLOAD.pull_request !== undefined;
export const CURRENT_BRANCH: string = github.context.ref;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
export const TARGET_BRANCH: string | undefined = PAYLOAD.pull_request?.base.ref;
