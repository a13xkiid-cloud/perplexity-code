import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs, styleText } from 'node:util';
import { debug } from './commands/debug.js';
import { explain } from './commands/explain.js';
import { convert } from './commands/convert.js';
import { refactor } from './commands/refactor.js';
import { listProviderModels } from '../utils/providers.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const modes = { debug, explain, convert, refactor };

const help = `Usage: pxc [options] [command] [prompt]

Explain, debug, convert, or refactor code with a selected AI provider.

Commands:
  /explain                 Explain the input (default)
  /debug                   Find and explain problems
  /convert                 Convert code to another language
  /refactor                Improve existing code

Options:
  -f, --file <path>        Read input from a file
      --provider <name>    ollama (default), codex, or gateway
      --model <id>         Select an exact model ID
      --list-models        List models for the selected provider
  -h, --help               Show help
  -V, --version            Show version

Without a prompt or file, input can be piped through standard input.
`;

function loadEnvFile() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return;
  try {
    process.loadEnvFile(path);
  } catch {
    throw new Error('Could not load the .env file in the current directory.');
  }
}

function selectMode(positionals) {
  const [first = '', ...rest] = positionals;
  const match = first.match(/^\/(explain|debug|convert|refactor)(?=\s|$)/);
  if (!match) return { mode: explain, prompt: positionals.join(' ') };
  const inline = first.slice(match[0].length).trim();
  return { mode: modes[match[1]], prompt: [inline, ...rest].filter(Boolean).join(' ') };
}

async function readInput(prompt, file) {
  if (file !== undefined) {
    if (!file) throw new Error('The file path must not be empty.');
    return readFile(file, 'utf8');
  }
  if (prompt) return prompt;
  if (process.stdin.isTTY) return '';
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) input += chunk;
  return input;
}

export async function runCli(argv = process.argv.slice(2)) {
  try {
    loadEnvFile();
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        file: { type: 'string', short: 'f' },
        provider: { type: 'string' },
        model: { type: 'string' },
        'list-models': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'V' },
      },
    });

    if (values.help) {
      process.stdout.write(help);
      return 0;
    }
    if (values.version) {
      console.log(version);
      return 0;
    }
    if (values['list-models']) {
      const models = await listProviderModels({ provider: values.provider });
      console.log(models.length ? models.join('\n') : 'No models are available for this provider.');
      return 0;
    }

    const { mode, prompt } = selectMode(positionals);
    const input = await readInput(prompt, values.file);
    if (!input.trim()) throw new Error('No input provided. Pass a prompt, --file, or standard input.');
    await mode(input, { provider: values.provider, model: values.model });
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error(styleText('red', `Error: ${message}`));
    return 1;
  }
}
