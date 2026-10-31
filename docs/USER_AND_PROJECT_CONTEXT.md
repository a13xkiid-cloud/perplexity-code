# User and project context for coding assistants

This document records durable context for GitHub Copilot and other coding assistants. It is not a transcript and contains no credentials.

> **Provenance note.** This file and `.github/copilot-instructions.md` were
> written in a Codex cloud session on 2026-10-31 and recovered from its shared
> transcript. That transcript reports a local commit, `0ee28e8`, in the earlier
> cloud workspace; it was not pushed and is not present in this checkout or the
> fork. The original provider selection, gateway integration, tests, and
> `.devcontainer/` files were not recovered; this branch rebuilds similar CLI
> functionality. Treat the "Verified state" section below as a historical record,
> not a description of this checkout.

## About the repository owner

The owner describes their practical coding knowledge as effectively zero. They are curious, willing to experiment, and comfortable using AI tools, but need the tools to make hidden assumptions visible.

What they already recognize by name:

- repository;
- commit;
- push;
- issue;
- release.

Do not infer that recognition means operational understanding. They are still learning:

- the difference between a fork on GitHub and a clone in a workspace;
- what exists only as an edited file versus a commit versus a pushed commit;
- what belongs to Git and what belongs to a cloud environment;
- the difference between source code, installed dependencies, running services, and public hosting;
- when a task requires a desktop, browser, terminal, or interactive login;
- which actions are reversible and which can expose or lose work.

The owner wants to learn while accomplishing the project. Explanations should produce confidence and independence rather than making the workflow mysterious.

### Communication preferences

- Lead with the outcome or current state.
- Use plain language and short paragraphs.
- Define jargon at the point of use.
- Give copyable commands, but explain each command before expecting it to be run.
- State the working directory explicitly, for example `cd /workspace/perplexity-code`.
- State whether a command only reads information or changes files, Git history, GitHub, a cloud configuration, or a running service.
- Include expected success evidence and likely failure meaning.
- Avoid presenting many equivalent choices when one recommendation is enough.
- Do not shame beginner questions or pretend an ambiguous request is clear.
- If the user is on mobile, distinguish actions that can be reviewed on a phone from those that need a proper terminal or browser callback flow.

### Decision and approval preferences

The owner wants agents to perform useful, reversible work rather than merely offer plans. However, agents should pause before actions that publish, expose, charge, merge, release, delete, overwrite, or make private account access available to other people.

Before a consequential action, present the concrete result that is ready and name the exact action awaiting approval.

## What the owner is trying to build

The long-term goal is a private AI workspace with a Perplexity-like research experience plus coding assistance.

Desired user-facing capabilities:

- simple chat;
- coding chat and Codex-style assistance;
- web search;
- visible citations and source links;
- search and conversation history;
- file uploads and document questions;
- choice of provider and model;
- local models where practical;
- eventual private hosting that the owner can access reliably.

The owner initially expected the `perplexity-code` repository to contain a full Perplexity-style interface. It does not. It is a small terminal CLI. Vane, formerly called Perplexica, was added as a separate checkout because it supplies the closer web/search experience.

### Provider intent

The owner wants to use existing subscriptions or legitimate account authorization where possible, especially:

- ChatGPT/OpenAI subscription access for Codex;
- Gemini or Antigravity account access;
- Claude chat/model access if a legitimate supported or clearly disclosed community route exists;
- Ollama for local models.

The owner does not want a design that silently depends on separately billed OpenAI, Gemini, or Anthropic API keys.

Do not assume a consumer chat subscription grants general API access. Distinguish:

- the provider's consumer web product;
- an official coding CLI entitlement;
- an OAuth flow;
- API billing and API keys;
- a community bridge that adapts a subscription-backed CLI.

Free Claude web-account integration was not verified. Codex login does not import personal or work ChatGPT conversation history. Antigravity support currently uses a community gateway flow, not an installed official `agy` binary. Recheck provider documentation and actual account behavior before promising more.

The owner's exact Claude plan is ambiguous: at one point they described a free Claude account, and later referred generally to paid subscriptions for all providers. Ask them to confirm the plan only when it materially affects a Claude integration. Never infer API entitlement from the answer.

## Tools the owner uses or wants to learn

### Git and GitHub

The owner wants to learn repositories, forks, clones, working trees, staging, commits, branches, remotes, pushes, pulls, issues, pull requests, tags, releases, Actions, Codespaces, and deployment.

Teach the location and effect of each operation. In particular:

- editing changes the local working tree;
- staging selects changes for a commit;
- committing adds to local Git history;
- pushing sends commits to GitHub;
- opening a pull request proposes a merge;
- releasing labels and publishes a selected version;
- deploying runs software on a persistent host.

### AI assistants

The owner intends to combine tools rather than rely on one:

- GitHub Copilot Pro for repository-local editing, explanations, reviews, and GitHub workflows;
- Codex for sustained coding and cloud-workspace tasks;
- ChatGPT for conceptual help, decisions, and general learning;
- Gemini/Antigravity for another coding/model route;
- Claude if legitimate account access can be established;
- Agentic Search by Liner or other research tools when current external information is needed.

Do not duplicate work simply to consume quota. Recommend the tool with the best context and capability for the specific task. Never make claims about remaining plan quota unless the relevant service reports it directly.

### Development and runtime tools

The current stack includes or explores:

- Node.js, npm, and Yarn;
- terminal commands and shell scripts;
- VS Code and GitHub Codespaces;
- devcontainers;
- Docker and containers;
- Ollama and local model files;
- the official Codex CLI;
- CLIProxyAPI as a community subscription gateway;
- Vane/Perplexica as the web interface;
- SearXNG as the search backend;
- OAuth and browser/device login flows.

When introducing one of these tools, explain the job it performs in this system and what data it stores.

## Earlier cloud architecture

### Repository 1: the owner's fork

Path in the prepared cloud workspace:

```text
/workspace/perplexity-code
```

GitHub remote:

```text
https://github.com/a13xkiid-cloud/perplexity-code.git
```

Current feature direction:

- preserve the original explain/debug/convert/refactor CLI modes;
- support Ollama, a local subscription gateway, and direct Codex;
- let the user select a real provider model;
- provide useful failures instead of unhandled child-process errors;
- provide a reproducible Codespaces fallback.

The earlier cloud checkout was on branch `work`; its changes were initially
uncommitted and were later reported as committed locally. Always recheck the
branch and status in the current checkout.

The project currently has no committed dependency lockfile. Do not create, remove, or reinterpret that policy as part of an unrelated task. If dependency reproducibility becomes the task, explain the tradeoff and scope the change deliberately.

### Repository 2: Vane

Prepared cloud path:

```text
/workspace/vane
```

Upstream repository:

```text
https://github.com/ItzCrazyKns/Vane.git
```

Vane is separate from the owner's fork. Its tracked source was kept clean during environment setup. It provides the Perplexity-like interface, history, uploads, provider configuration, and search workflow. It is currently a development dependency, not code that has been merged into this repository.

### Runtime-only directories

These are outside Git and must stay outside Git:

```text
/workspace/ollama-runtime
/workspace/subscription-gateway
/workspace/vane-runtime
/workspace/private-ai
```

They contain installed binaries, helpers, service configuration, caches, private local keys, OAuth profiles, model files, and runtime data.

### Cloud environment configuration

The managed cloud environment has a separate configuration draft containing:

- repository membership;
- installation commands;
- startup instructions;
- an outbound network allowlist.

That draft is not part of Git. Saving a draft does not apply or publish it. The owner must review and publish it through the environment settings. Always read current environment status before claiming those settings are active.

## Verified state as of 2026-10-31

These statements were verified in the prepared cloud workspace but must be rechecked in a new machine or Codespace:

- The modified CLI integration suite passed 12 tests.
- `git diff --check` passed.
- Ollama 0.40.13 was installed from a checksum-verified official release.
- Official Codex CLI 0.166.0 was installed in an isolated tool directory.
- CLIProxyAPI 8.0.48 was installed from a checksum-verified community release.
- The gateway rejected an unauthenticated model-list request and accepted its private local client credential.
- No upstream account was authorized, so the authenticated gateway catalog contained zero models.
- Vane dependencies installed and its TypeScript check passed.
- Vane's development UI, SQLite history API, provider configuration, and SearXNG health checks passed.
- Vane and Ollama reported zero usable chat models.

Known incomplete or blocked work:

- the active environment network policy had not yet adopted the saved custom host list;
- Ollama model download was blocked at `registry.ollama.ai`;
- Codex device login was blocked at `auth.openai.com`;
- Antigravity reached the browser/callback flow, but account exchange and inference were not completed;
- real SearXNG results were blocked by destination policy;
- Vane production build was blocked while fetching Google Fonts;
- no real provider model response was verified;
- no real cited Vane search was verified;
- no public or private persistent deployment was created;
- no code was pushed to GitHub from this workspace.

Do not convert those incomplete items into success claims merely because source tests pass.

## Authentication rules

Only the owner completes interactive provider authorization.

- Show the official or community tool's device code or authorization URL only in the owner's terminal.
- Never ask the owner to paste a password into chat.
- Never ask them to paste an OAuth callback URL into chat. It contains a one-time code.
- Keep provider profiles isolated from the surrounding coding agent's own account.
- Never commit auth profiles.
- Verify login by account/status metadata and a real model request without printing token values.
- Explain whether the integration is official or community maintained.

For remote Antigravity authorization, the community tool may redirect the browser to an unavailable localhost URL. The owner can copy the complete browser address and paste it into the waiting terminal prompt. That address must stay out of chat and logs.

## Git safety for this beginner

Before any Git mutation, establish these facts:

```bash
git status --short
git branch --show-current
git remote -v
git diff --stat
```

Explain the result. Do not use destructive Git commands to make the output look clean.

When preparing a commit:

1. Group only the files that belong to one coherent change.
2. Explain `git add` as selecting changes, not uploading them.
3. Show what is staged with `git diff --cached --stat` and, when useful, `git diff --cached`.
4. Run the relevant tests.
5. Explain that `git commit` records locally and does not reach GitHub.
6. Confirm the remote branch before `git push`.
7. Verify the pushed commit on the remote.

Never add the entire workspace recursively. Never include private runtime paths. Never assume `git push origin main` is correct when the current branch is `work`.

## Hosting and deployment expectations

The owner wants a link they can open, but source hosting and application hosting are different.

- A GitHub repository link exposes source according to repository permissions.
- A Codespace runs a development machine and can forward ports temporarily.
- GitHub Pages cannot run this Node/Docker/OAuth/database stack.
- A persistent deployment needs a compatible server or application platform.
- Vane must receive authentication before its provider configuration can be safely exposed to other users or the public Internet.

Before recommending a hosting target, identify:

- whether Docker is supported;
- persistent storage needs;
- secret storage;
- access control;
- private networking between Vane, SearXNG, Ollama, and the gateway;
- model resource requirements;
- expected cost;
- backup and update strategy.

Do not deploy first and add security later.

## Documentation boundaries

The README describes the CLI in this checkout, not a deployed web application.
The Codespaces configuration supplies a Node.js development environment; it
does not install Vane or authorize provider accounts. Preserve the upstream
project's attribution when updating documentation.

## How to teach through the work

When a task introduces an unfamiliar concept, include a short durable lesson:

```text
Term: branch
Meaning: an independent line of repository history.
What we are doing: keeping the current feature work on branch `work`.
What it does not do: it does not publish or deploy the application.
How to verify: `git branch --show-current`.
```

Keep lessons tied to the action at hand. Do not front-load an entire textbook when the user needs one decision.

At the end of meaningful work, report:

- what changed;
- where it exists;
- what was tested;
- whether it was committed;
- whether it was pushed;
- whether it is running;
- whether it is reachable by anyone else;
- what the owner must do personally next.

## Durable references in this workspace

When available, consult:

- `.devcontainer/README.md` for Codespaces and gateway commands;
- `README.md` for CLI usage;
- `/workspace/subscription-gateway/README.md` for private gateway/login procedures;
- `/workspace/vane-runtime/README.md` for Vane/SearXNG startup and validation;
- `/workspace/repository-basics.pdf` for the owner's beginner Git/GitHub guide.

The absolute `/workspace` references exist in the managed cloud environment and may not exist in an ordinary GitHub clone. Treat missing runtime references as environment differences, not repository corruption.
