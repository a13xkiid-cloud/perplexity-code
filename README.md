# Perplexity-Code 🧠💻


**AI-Driven Code Assistant — Built for Cursor, VSCode & CLI**  
_NPM Package: `perplexity-code`_

[![npm version](https://img.shields.io/npm/v/perplexity-code.svg)](https://www.npmjs.com/package/perplexity-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/holasoymalva/perplexity-code/main.yml)](https://github.com/holasoymalva/perplexity-code/actions)
[![Twitter](https://img.shields.io/twitter/follow/holasoymalva?style=social)](https://twitter.com/holasoymalva)

> The power of Perplexity, reimagined for developers.  
> Ask questions. Generate code. Debug. Refactor. All from your favorite terminal or editor.

![image](https://github.com/user-attachments/assets/c6f7b95d-7c62-4999-9112-aaff6036decf)

---

## ✨ What is `perplexity-code`?

**Perplexity-Code** is an open-source, NPM-installable CLI tool for AI-enhanced software development.  
It integrates seamlessly with your terminal, **Cursor**, or **VSCode** workflow and helps you:

- Search technical topics
- Explain or debug code
- Convert between programming languages
- Refactor and optimize code snippets

Powered by Perplexity (or configurable LLM APIs), this tool turns your terminal into a coding knowledge copilot.

---

## 🔧 Installation

### Global installation

```bash
npm install -g perplexity-code
````

> You can now run the CLI using `perplexity-code` or `pxc`.

### One-off use (no install required)

```bash
npx perplexity-code "What is the difference between var, let and const?"
```

---

## 🚀 Usage Examples

```bash
pxc "How do I write a GraphQL resolver in Node.js?"
```

```bash
pxc /explain "./src/hooks/useAuth.ts"
```

```bash
pxc /convert "Convert this Python dict to a TypeScript interface"
```

```bash
pxc /debug "Cannot read property 'length' of undefined"
```

You can also pipe code:

```bash
cat main.py | pxc /refactor
```

---

## ⚙️ Configuration

Create a `.perplexityrc` or `perplexity.config.json` in your project or home directory:

```json
{
  "apiKey": "sk-XXXXXX",
  "model": "perplexity-codellama",
  "language": "typescript",
  "editor": "vscode"
}
```

Or pass options via CLI:

```bash
pxc "Explain async/await" --model perplexity-codellama --language javascript
```

---

## 🧩 Editor Integrations

### ✅ Cursor

1. Open Cursor → Settings → Plugins
2. Add path to `perplexity-code` binary
3. Use inline queries like `/explain` or `/debug` in the editor

### ✅ VSCode (coming soon)

* Native extension with slash commands and inline answers
* Chat-style interface with syntax-aware suggestions

---

## 🔥 Features

* 💬 Slash-based commands: `/explain`, `/debug`, `/convert`, `/optimize`, `/summarize`
* 🧠 Context-aware answers with code formatting
* 🧪 Multi-model support (Perplexity, Gemini, OpenAI)
* 📂 File-based input and stdin piping
* 🛠️ Works inside tmux, iterm, Warp, or Cursor

---

## 🛤 Roadmap

* [ ] VSCode extension release
* [ ] Git diff-aware prompts (`/review`)
* [ ] Multi-language translation mode
* [ ] Plugins: `/test`, `/doc`, `/summarize`
* [ ] Local LLM fallback (offline mode)

---

## 🤝 Contributing

We’d love your input, ideas, and PRs. Start with:

```bash
git clone https://github.com/holasoymalva/perplexity-code.git
cd perplexity-code
npm install
npm link # for local CLI testing
```

> Want to contribute a command? Check out `/src/commands`.

---

## 📦 Publishing Notes (for maintainers)

To publish a new version to NPM:

```bash
npm version patch
npm publish
```

Ensure you are logged in to NPM with correct credentials.

---

## 📄 License

MIT License © 2025 [@holasoymalva](https://github.com/holasoymalva)

---

## 🌐 Links

* GitHub: [https://github.com/holasoymalva/perplexity-code](https://github.com/holasoymalva/perplexity-code)
* NPM: [https://npmjs.com/package/perplexity-code](https://npmjs.com/package/perplexity-code)
* Twitter: [@holasoymalva](https://twitter.com/holasoymalva)

> Built for the curious. Made for developers. Ready for your terminal. ⚡️
