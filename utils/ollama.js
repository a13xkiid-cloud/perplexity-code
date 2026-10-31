import { childEnvironment, runExternal } from './process.js';

export const DEFAULT_OLLAMA_MODEL = 'deepseek-coder:base';

export async function askLocalLLM(prompt, { model = DEFAULT_OLLAMA_MODEL } = {}) {
  const output = await runExternal('ollama', ['run', model], {
    input: `${prompt}\n`,
    env: childEnvironment(),
    name: 'Ollama',
  });
  if (!output) throw new Error('Ollama returned an empty response.');
  return output;
}

export async function listLocalModels() {
  const output = await runExternal('ollama', ['list'], {
    env: childEnvironment(),
    name: 'Ollama',
  });
  if (!output) return [];

  const lines = output.split(/\r?\n/).filter((line) => line.trim());
  if (!/^\s*NAME(?:\s|$)/i.test(lines[0])) {
    throw new Error('Ollama returned an unexpected model list.');
  }
  return lines.slice(1).map((line) => line.trim().split(/\s+/)[0]);
}