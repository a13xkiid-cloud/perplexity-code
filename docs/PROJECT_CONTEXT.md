# Project context for contributors

This document describes the repository's implementation, not a separate
development environment or a planned product. Recheck the current branch when
making changes and update this context alongside relevant implementation work.

## Scope and structure

Perplexity-Code is a terminal assistant for explaining, debugging, converting,
and refactoring code. The current implementation uses Ollama with the
hard-coded model `deepseek-coder:base`.

| Location | Responsibility |
| --- | --- |
| `bin/pxc.js` | CLI options, input loading, and command dispatch |
| `src/commands/` | Mode-specific prompts and terminal output |
| `utils/ollama.js` | Launching Ollama and collecting its output |
| `package.json` | Package entry points, dependencies, and scripts |

The entry point accepts a query and an optional `--file` path. A file takes
precedence over query text; without either, input can be read from standard
input. Query prefixes select debug, convert, or refactor mode, with explain
as the default.

Ollama installation, its running service, and model availability are external
to this repository. The source does not currently implement provider or model
selection, model discovery, Codex or gateway integration, a hosted web
interface, web search, or a development-container configuration. Do not infer
those capabilities from marketing text or work in another checkout.

## Dependencies and verification

The project uses Node.js ES modules. Its declared dependencies are `axios`,
`chalk`, and `commander`. The CLI also imports `dotenv`, which is not declared
in the current manifest; a clean environment may therefore fail to start it.
Document this limitation rather than claiming a clean installation was
verified.

There is no committed automated test suite in this baseline. `npm test` runs
`echo "No tests yet"` and should not be counted as application validation.

From the repository root, `git diff --check` checks pending changes for
whitespace errors. Once the required dependencies are available,
`node bin/pxc.js --help` is a CLI startup check, not a provider-inference test.
Record the actual result of each check and any blockers.

When adding behavior, add checks that exercise it and its failure paths.
Tests using simulated providers do not prove that a real model is installed,
authorized, or able to respond.

## Runtime and publication boundaries

Keep local environment files, credentials, provider profiles, model downloads,
and service data outside version control. Do not copy personal account or
conversation details into contributor documentation.

Editing files changes a working tree; committing records local history;
pushing publishes commits to a remote. A pull request proposes a merge and
does not install software, start services, or deploy the application.
