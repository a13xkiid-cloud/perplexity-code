# Developing in Codespaces

This configuration provides Node.js for working on the CLI. It does not install
Ollama, Codex, a community gateway, models, or the separate web interface. It
does not sign in to any account, forward a port, or deploy an application.

Open a Codespace from your fork when you choose to use one. Codespaces can incur
charges depending on your GitHub plan and usage. In the Codespace terminal, from
the repository directory, run:

```bash
node --test
node bin/pxc.js --help
```

The first command runs local tests with simulated providers. The second prints
CLI usage. Neither proves that a real model is available.

To use a provider, install or start it separately and follow the main README.
`127.0.0.1` inside a Codespace means the Codespace itself, not your personal
computer. Keep gateway services private and do not forward their ports publicly.
Complete any account sign-in yourself, and never put credentials in the
repository or paste them into a chat.
