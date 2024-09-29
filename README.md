<div align="center">

# Vue Mess Detector Action

_A static code analysis tool for detecting code smells and best practice
violations in Vue.js and Nuxt.js projects._

![Release](https://img.shields.io/github/v/release/brenoepics/vmd-action?include_prereleases&sort=semver&logo=github)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/brenoepics/vmd-action/ci.yml?logo=github)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/brenoepics/vmd-action?logo=github)
</div>

Easily integrate [Vue Mess Detector](https://github.com/rrd108/vue-mess-detector) into your CI pipeline to receive pull
request alerts and display badges effortlessly.

<details>
<summary>Preview</summary>

![image](https://github.com/user-attachments/assets/aea8dbb9-49c8-4206-abba-9e4d475040ad)
![img.png](preview.png)

</details>

## Installation

> [!TIP]
> Reference: [How to Use Vue Mess Detector](https://vue-mess-detector.webmania.cc/)

You can add this action as a step in your [GitHub Actions](https://github.com/features/actions)
workflow.
Here's an example of how to
use it:

```yml
name: VMD Analysis

on:
  workflow_dispatch:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read
  pull-requests: write

jobs:
  detect-mess:
    runs-on: ubuntu-latest
    name: Detect Vue Mess
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Vue Mess Detector Analysis
        uses: brenoepics/vmd-action@v0.0.4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          # check inputs for full args list

```

## Usage

After installing the `vmd-action`, Once a pull request is opened, you will start receiving comments and report
artifacts.

## Inputs

> [!TIP]
> You can find the list of inputs and their descriptions in the [action.yml](action.yml) file.

| Input             | Description                                          | Required | Default                                                 |
|-------------------|------------------------------------------------------|----------|---------------------------------------------------------|
| github-token      | GitHub token for commenting on pull requests         | `false`  |                                                         |
| version           | Version of Vue Mess Detector                         | `true`   | [`latest`](https://github.com/rrd108/vue-mess-detector) |
| skipInstall       | Skip the installation of Vue Mess Detector           | `true`   | `false`                                                 |
| skipBots          | Skip running analysis on pull requests from bots     | `true`   | `true`                                                  |
| commentsEnabled   | Comment on Pull requests?                            | `true`   | `true`                                                  |
| packageManager    | Package manager to use                               | `false`  | (detect)                                                |
| runArgs           | Arguments to pass to Vue Mess Detector               | `false`  | `--group=file`                                          |
| entryPoint        | Entry point for Vue Mess Detector                    | `false`  | `./`                                                    |
| srcDir            | Source directory to analyze                          | `true`   | `src/`                                                  |
| deleteOldComments | Delete old report comments on pull requests?         | `false`  | `false`                                                 |
| relativeMode      | Compare the current branch with the target (PR only) | `true`   | `true`                                                  |

## Contributing

We welcome contributions to this project! Please read our [Contributing Guide](CONTRIBUTING.md) for more information on
how to contribute.

If you've found this project useful, please consider giving it a ⭐ on GitHub.
This helps to spread the awareness of the
project and is a great way to show your support!

## License

This project is licensed under the MIT License.
