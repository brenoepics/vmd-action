import * as core from "@actions/core";
import { runVueMessDetector } from "./analyser.js";
import { ActionInputs, readActionInputs } from "./github/utils.js";

/**
 * The main function for the action, which reads the inputs and runs the Vue Mess Detector.
 * @returns {void} Resolves when the action is complete.
 */
export function run(): void {
  try {
    const input: ActionInputs = readActionInputs();
    if (input.entryPoint) {
      core.info(`Using entry point: ${input.entryPoint}`);
      process.chdir(input.entryPoint);
    }
    void runVueMessDetector(input).then(() => {
      core.info("Vue Mess Detector has finished running!");
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
