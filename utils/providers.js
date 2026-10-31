import { askCodex, listCodexModels } from './codex.js';
import { askGateway, listGatewayModels } from './gateway.js';
import { askLocalLLM, DEFAULT_OLLAMA_MODEL, listLocalModels } from './ollama.js';

const providers = {
  ollama: {
    ask: (prompt, model) => askLocalLLM(prompt, { model: model ?? DEFAULT_OLLAMA_MODEL }),
    list: listLocalModels,
  },
  codex: { ask: askCodex, list: listCodexModels },
  gateway: { ask: askGateway, list: listGatewayModels },
};

function selectedProvider(name) {
  const selected = name ?? process.env.PXC_PROVIDER ?? 'ollama';
  if (!Object.hasOwn(providers, selected)) {
    throw new Error('Unknown provider. Choose ollama, codex, or gateway.');
  }
  return providers[selected];
}

function selectedModel(model) {
  const selected = model ?? process.env.PXC_MODEL;
  if (selected !== undefined && (
    typeof selected !== 'string'
    || !selected
    || selected.startsWith('-')
    || /\s/.test(selected)
  )) {
    throw new Error('The model ID must be non-empty, contain no whitespace, and not start with a hyphen.');
  }
  return selected;
}

export async function askProvider(prompt, { provider, model } = {}) {
  return selectedProvider(provider).ask(prompt, selectedModel(model));
}

export async function listProviderModels({ provider } = {}) {
  return selectedProvider(provider).list();
}
