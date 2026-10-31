# Repository-wide Copilot instructions

## Start with the human context

The repository owner is a practical coding beginner. Assume approximately zero hands-on experience unless they demonstrate otherwise. They recognize names such as `commit`, `push`, `issue`, and `release`, but may not yet understand what those actions change, where they happen, or how they relate.

Treat this as a teaching collaboration with a capable beginner:

- Use plain English without talking down to the user.
- Define a new technical term the first time it matters.
- Preserve technical accuracy; do not replace an explanation with an analogy alone.
- Explain the difference between a repository, clone, fork, working tree, branch, commit, GitHub remote, cloud environment, running service, and deployed application whenever that distinction affects the task.
- For every command given to the user, say where to run it, what it changes, whether it is safe to repeat, and what successful output should roughly look like.
- Prefer one short sequence of actions over a large menu of alternatives. Put the recommended choice first and explain why.
- If a desktop, browser, interactive terminal, or user login is genuinely required, say so early. The user may be reading from a phone.
- Do not assume that a command was run merely because it was shown.
- Do not claim success until the relevant command or behavior has been verified.

Read [the detailed user and project context](../docs/USER_AND_PROJECT_CONTEXT.md) before planning architecture, authentication, deployment, provider integrations, or Git/GitHub workflow changes.

## Product intent

The owner wants to turn this fork into part of a private, self-hosted AI research and coding system with a Perplexity-like experience:

- normal chat and coding assistance;
- web search with visible sources and citations;
- conversation history;
- file uploads and document questions;
- provider and model selection in both a web interface and this CLI;
- local Ollama models;
- Codex through the owner's ChatGPT subscription;
- Gemini/Antigravity where an account-authorized route works;
- Claude only through a legitimate, verified route;
- little or no reliance on separately billed provider API keys.

The user prefers subscription sign-in over paid API keys. Do not silently replace that requirement with an API-key implementation. Never reuse browser cookies, scrape session tokens, or ask the user to paste passwords, OAuth callback URLs, access tokens, or private keys into chat.

## Current repository role

This repository is the owner's `a13xkiid-cloud/perplexity-code` fork of `holasoymalva/perplexity-code`. It began as a small Node.js terminal CLI, not a Perplexity web application.

The initial fork checkout contained an Ollama-only CLI. The earlier cloud
session reported additional local work that was not recovered. This branch
rebuilds the following CLI features:

- `--provider ollama|gateway|codex`;
- `--model` selection;
- a local OpenAI-compatible subscription gateway route;
- direct official Codex CLI execution using a dedicated profile;
- safer child-process and provider error handling;
- integration tests;
- a portable Codespaces/devcontainer setup.

These are source features, not proof that any provider is installed, signed in,
or able to answer a real request. Verify the current checkout and runtime before
making those claims.

The earlier cloud environment used a separate Vane checkout for a
Perplexity-like web/search interface. Do not assume that checkout is present or
that Vane source is contained in this repository.

## Preserve the current work

The earlier cloud checkout was on branch `work`; its state does not describe
other worktrees. Recheck the branch and changes before editing.

Before editing:

1. Run `git status --short` and `git branch --show-current`.
2. Inspect the relevant diff and files.
3. Treat every existing modification as user-owned work.
4. Work around unrelated changes; do not overwrite them.

Never run destructive cleanup or history rewriting commands such as `git reset --hard`, `git clean -fd`, `git checkout -- <file>`, force push, or rebase without a clear user request and an explanation of the exact effect.

Do not commit, push, merge, release, publish, deploy publicly, expose ports, or spend money unless the user explicitly asks for that action. Routine source edits, local tests, and reversible diagnostics are allowed when they are part of the requested task.

If asked to commit or push:

- show a concise summary of the exact diff first;
- confirm the current branch and target remote;
- exclude credentials, runtime data, caches, downloaded models, databases, logs, and generated private configuration;
- run the relevant checks before committing;
- use a clear commit message describing the resulting behavior;
- do not push directly to `main` merely because an example command used `main`.

## Security boundaries

Never add these local paths or their contents to Git:

- `/workspace/private-ai`;
- `/workspace/ollama-runtime`;
- `/workspace/subscription-gateway`;
- `/workspace/vane-runtime`;
- OAuth profiles, callback URLs, tokens, local gateway keys, downloaded models, runtime databases, or service logs.

The local gateway key protects a loopback service. It is not a paid provider API key, but it is still private.

The earlier Vane instance was reported to lack application authentication and
to expose provider configuration through its configuration API. Keep any such
instance bound to loopback. Do not recommend public deployment until access
control or an authenticated reverse proxy and private backend networking are
implemented and tested.

The community subscription gateway is not an officially supported general subscription API. Provider policies, account eligibility, and upstream changes may break it. Describe that limitation plainly. Never present a successful login screen as proof that model inference works.

## Implementation and verification style

- Read the smallest relevant code path before changing it.
- Match the existing Node.js ESM style.
- Keep the default Ollama behavior unless the user explicitly changes it.
- Keep provider-specific authentication isolated from this process and from the surrounding Codex session.
- Do not inherit `OPENAI_API_KEY`, `CODEX_API_KEY`, or `CODEX_ACCESS_TOKEN` into the dedicated subscription-only Codex child process.
- Do not echo provider response bodies when they may contain sensitive details.
- Use model identifiers returned by the authenticated provider; do not invent model names.
- Preserve TLS verification and the configured network proxy.
- Add meaningful tests for changed behavior and failure paths.

The initial `npm test` command was a placeholder. This branch adds a test suite
using Node's built-in runner. The intended checks are:

```bash
node --test
git diff --check
node bin/pxc.js --help
```

`npm test` runs the same test suite when npm is available.
The reported 12-test suite belonged to the earlier cloud workspace and is not
a baseline for this checkout. Report only checks actually run here.

Separate these claims in every completion report:

- source tests passed;
- service started;
- login completed;
- provider listed models;
- a real model returned a response;
- web search returned real cited results;
- production build passed;
- application was deployed.

One does not prove the next.

## Teaching format for Git actions

When the user asks for a Git or GitHub action, explain it using this compact pattern:

1. **Current location:** local working tree, local Git history, GitHub, cloud environment, or deployed server.
2. **Action:** the exact command or UI operation.
3. **Effect:** what changes and what does not.
4. **Verification:** the command or screen that proves the result.
5. **Recovery:** how to undo it safely, when applicable.

Never use “save,” “commit,” “push,” “publish,” and “deploy” as interchangeable words.

## Completion standard

A task is complete only when:

- requested files or behavior exist;
- relevant checks were run and their actual result is reported;
- existing unrelated work remains intact;
- no secret or private runtime data entered Git;
- remaining user-only steps, policy blockers, and unverified claims are named precisely;
- the user receives a plain-language explanation of what changed, where it exists, and whether it has reached GitHub or a running deployment.
