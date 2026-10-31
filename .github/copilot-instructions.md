# Repository-wide Copilot instructions

Read [the project context](../docs/PROJECT_CONTEXT.md) before changing the CLI,
its dependencies, provider integration, or verification workflow. Base claims
on the checked-out source rather than descriptions of another environment.

## Current implementation

- This is a Node.js ES module CLI, not a hosted web application.
- `bin/pxc.js` parses the query and `--file` option and selects a command mode.
- The command modules provide explain, debug, convert, and refactor prompts.
- `utils/ollama.js` invokes `ollama run deepseek-coder:base`.
- The current `npm test` script only prints `No tests yet`. It is not a test
  suite and does not demonstrate that the application works.
- Do not describe provider selection, model discovery, account integrations,
  web search, or a development container as implemented unless the relevant
  code exists in the current branch.

## Before editing

Run these read-only checks from the repository root:

```bash
git status --short
git branch --show-current
git diff
```

Inspect the relevant files and preserve pre-existing modifications. Keep
changes focused on the requested behavior; do not replace unrelated work or
rewrite Git history to make a checkout appear clean.

## Implementation and verification

- Follow the existing ES module layout and command boundaries.
- Preserve existing command modes and the default model unless the requested
  change intentionally alters them.
- Check imports against `package.json` when changing dependencies. The current
  entry point imports `dotenv`, but the manifest does not declare it.
- Add meaningful checks when changing behavior. Do not report the placeholder
  test script as passing application tests.
- Distinguish source checks, CLI startup, provider availability, and a real
  model response. Success at one level does not prove the next.
- Report missing dependencies and unavailable services explicitly; do not
  claim a check passed when it could not run.
- Update directly related documentation when capabilities or commands change.

## Git and data safety

- Confirm the branch, target repository, and selected files before committing
  or publishing changes.
- Keep credentials, account profiles, personal transcripts, local
  configuration, downloaded models, and runtime data out of commits.
- Inspect the history being published, not only the final file contents.
  Removing sensitive text in a later commit does not remove it from history.
- Do not install provider software, authorize accounts, expose services,
  merge, or deploy merely because a source change is requested.
- Treat a pull request as a proposal to merge source code, not as a deployment
  or proof that a provider is configured.

## Communication

Use clear, concise explanations and define unfamiliar terms when they matter.
When giving commands, state where to run them, what they change, and how to
recognize success. Do not assume a user's experience or account access.

Completion reports should identify what changed, which checks actually ran,
remaining limitations, and whether the work is local, committed, or pushed.
