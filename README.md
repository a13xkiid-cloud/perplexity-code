# Perplexity-Code

Perplexity-Code is a terminal-based assistant for explaining, debugging,
converting, and refactoring code. It can connect to local Ollama, the official
Codex CLI using a separate ChatGPT sign-in, or a separately run local
OpenAI-compatible gateway.

This repository is a CLI, not a Perplexity-like website. It does not include
web search, citations, conversation history, Vane, or a hosted application.
Provider connections are not proof that a particular account or model works.

## Requirements

- Node.js 20.12 or later. The CLI has no third-party npm runtime dependencies.
- For Ollama: the Ollama executable, a running Ollama service, and access to a
  model.
- For Codex: the official Codex CLI with app-server support and a ChatGPT
  account authorized in the dedicated profile described below.
- For the gateway: a separately running, local OpenAI-compatible service and
  any local client credential it requires.

From the repository directory, show the available options:

```bash
node bin/pxc.js --help
```

Running a provider can send the supplied prompt to that provider. Codex is an
agent and may also inspect files in the current working directory; this CLI
starts it with a read-only sandbox and an ephemeral session.

## Using the CLI

Ollama is the default provider. Its default model is the original
`deepseek-coder:base`. Ollama may automatically download a missing model when
you run a request, using network bandwidth and disk space. List installed models
first if you want to avoid that download.

```bash
node bin/pxc.js "Explain async functions"
node bin/pxc.js /debug "Find the problem in this code"
node bin/pxc.js /convert --file ./example.js
cat ./example.js | node bin/pxc.js /refactor
```

The four modes are `/explain` (also the default), `/debug`, `/convert`, and
`/refactor`. Use `--file` to read a file, or pipe text through standard input.
An explicit file takes precedence over prompt text.

Select a provider or an exact model ID:

```bash
node bin/pxc.js --provider ollama --model MODEL_ID "Explain this code"
node bin/pxc.js --provider ollama --list-models
node bin/pxc.js --provider codex --list-models
node bin/pxc.js --provider gateway --list-models
```

Replace `MODEL_ID` with an ID returned by the relevant provider. A model list
is a provider's advertised catalog, not a guarantee of account entitlement or
a successful response. If listing or inference fails, the CLI reports an error
and does not silently switch providers.

`PXC_PROVIDER` and `PXC_MODEL` can set defaults; explicit CLI options take
precedence. Variables may also be placed in a local `.env` file in the current
directory. The repository ignores `.env`; do not commit credentials or paste
them into chat.

## Codex and ChatGPT sign-in

The CLI uses `~/.perplexity-code/codex` as a dedicated Codex profile. It does
not reuse the surrounding Codex session, inherit OpenAI/Codex API-key
variables, or accept an API-key profile as a ChatGPT login.

1. Make the official `codex` executable available on your `PATH`. If it is
   elsewhere, set `PXC_CODEX_PATH` to its absolute path for this CLI.
2. From the repository directory, run the following command. An unsigned-in
   profile will report a sign-in error; the command also creates the dedicated
   profile directory.

   ```bash
   node bin/pxc.js --provider codex --list-models
   ```

3. Sign in yourself in your terminal, using the same Codex executable:

   ```bash
   CODEX_HOME="$HOME/.perplexity-code/codex" codex login
   ```

   If `codex` is not on `PATH`, replace `codex` with the executable's full path.
   Complete any browser or device authorization privately. Do not share
   passwords, tokens, or callback URLs.
4. Repeat the model-list command, then choose an advertised model with
   `--provider codex --model MODEL_ID`. Without `--model`, Codex chooses its
   own default.

Subscription eligibility, limits, and supported models are determined by
OpenAI. A successful login or model list does not prove that inference works.

## Local gateway

The gateway is an optional, separately installed community service; this
project does not install it or perform its provider logins. Its support for
subscription accounts is not an official general-purpose subscription API and
may change or be restricted by provider policies.

Set `PXC_GATEWAY_URL` to the gateway's local API base URL, for example
`http://127.0.0.1:8317/v1` if that matches your gateway configuration. Only
`localhost`, `127.0.0.1`, and `::1` URLs are accepted. Credentials in URLs
and redirects are rejected.

If the gateway requires a **local client key**, provide it privately through
`PXC_GATEWAY_API_KEY`; this is not necessarily a paid provider API key. Keep
the gateway and its credentials private. List models, then use an ID from the
result:

```bash
node bin/pxc.js --provider gateway --list-models
node bin/pxc.js --provider gateway --model MODEL_ID "Explain this code"
```

## Development

Run the local automated checks from the repository directory:

```bash
node --test
node bin/pxc.js --help
git diff --check
```

The tests use simulated providers. They do not authenticate an account, download
a model, or demonstrate a real model response. `npm test` runs the same tests if
npm is available. The [Codespaces guide](.devcontainer/README.md) explains the
optional development container and its limits.

## License and attribution

MIT License. The original project is by [@holasoymalva](https://github.com/holasoymalva):
[holasoymalva/perplexity-code](https://github.com/holasoymalva/perplexity-code).
