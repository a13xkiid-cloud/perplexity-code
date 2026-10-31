import { spawn } from 'node:child_process';
import { mkdir, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { childEnvironment, runExternal } from './process.js';

const RPC_TIMEOUT_MS = 30_000;

async function canonicalPath(path) {
  try {
    return await realpath(path);
  } catch (error) {
    if (error.code === 'ENOENT') return resolve(path);
    throw new Error('Could not verify Codex profile isolation.');
  }
}

function isWithin(candidate, directory) {
  const path = relative(directory, candidate);
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

async function codexSettings() {
  const userHome = homedir();
  const home = join(userHome, '.perplexity-code', 'codex');
  try {
    await mkdir(home, { recursive: true, mode: 0o700 });
  } catch {
    throw new Error('Could not create the dedicated Codex profile directory.');
  }
  const actualHome = await canonicalPath(home);
  const otherHomes = [join(userHome, '.codex')];
  if (process.env.CODEX_HOME) otherHomes.push(process.env.CODEX_HOME);
  for (const otherHome of otherHomes) {
    if (isWithin(actualHome, await canonicalPath(otherHome))) {
      throw new Error('The dedicated Codex profile must be separate from the surrounding Codex profile.');
    }
  }
  return {
    command: process.env.PXC_CODEX_PATH || 'codex',
    env: childEnvironment({ codexHome: actualHome }),
  };
}

function createCodexClient({ command, env }) {
  let child;
  try {
    child = spawn(command, ['app-server'], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
  } catch {
    throw new Error('Could not start the Codex app server.');
  }

  const pending = new Map();
  const reader = createInterface({ input: child.stdout });
  let nextId = 1;
  let failure;

  function failAll(error) {
    if (!failure) failure = error;
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(failure);
    }
    pending.clear();
  }

  child.once('error', (error) => {
    failAll(new Error(
      error.code === 'ENOENT'
        ? 'Codex was not found. Install it or set PXC_CODEX_PATH to its executable.'
        : 'Could not start the Codex app server.',
    ));
  });
  child.once('close', () => {
    failAll(new Error('The Codex app server closed before completing the request.'));
  });
  child.stdin.on('error', () => {
    failAll(new Error('Could not communicate with the Codex app server.'));
  });
  child.stdout.on('error', () => {
    failAll(new Error('Could not read the Codex app server response.'));
  });
  child.stderr.on('error', () => {
    failAll(new Error('Could not read the Codex app server status.'));
  });
  child.stderr.resume();

  reader.on('line', (line) => {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      failAll(new Error('The Codex app server returned an invalid response.'));
      return;
    }

    const entry = pending.get(message?.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error || !Object.hasOwn(message, 'result')) {
      entry.reject(new Error(`Codex could not complete ${entry.method}. Check your sign-in and Codex version.`));
    } else {
      entry.resolve(message.result);
    }
  });

  function send(message) {
    if (failure) throw failure;
    child.stdin.write(`${JSON.stringify(message)}\n`, (error) => {
      if (error) failAll(new Error('Could not communicate with the Codex app server.'));
    });
  }

  function request(method, params) {
    if (failure) return Promise.reject(failure);
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Codex timed out while waiting for ${method}.`));
      }, RPC_TIMEOUT_MS);
      timer.unref();
      pending.set(id, { resolve, reject, timer, method });
      try {
        send({ id, method, params });
      } catch (error) {
        clearTimeout(timer);
        pending.delete(id);
        reject(error);
      }
    });
  }

  return {
    request,
    notify(method, params) {
      send({ method, params });
    },
    close() {
      reader.close();
      child.stdin.end();
      if (child.exitCode === null) child.kill();
      failAll(new Error('The Codex app server was closed.'));
    },
  };
}

async function withSignedInCodex(action) {
  const settings = await codexSettings();
  const client = createCodexClient(settings);
  try {
    await client.request('initialize', {
      clientInfo: { name: 'perplexity_code', title: 'Perplexity Code', version: '0.1.2' },
    });
    client.notify('initialized', {});
    const account = await client.request('account/read', { refreshToken: false });
    if (account?.account?.type !== 'chatgpt') {
      throw new Error('Sign in to the dedicated Codex profile with ChatGPT; API-key profiles are not supported.');
    }
    return await action(client, settings);
  } finally {
    client.close();
  }
}

export async function askCodex(prompt, model) {
  const settings = await withSignedInCodex(async (_client, config) => config);
  const args = ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', '--ephemeral'];
  if (model) args.push('--model', model);
  args.push('-');
  const output = await runExternal(settings.command, args, {
    input: prompt,
    env: settings.env,
    name: 'Codex',
  });
  if (!output) throw new Error('Codex returned an empty response.');
  return output;
}

export async function listCodexModels() {
  return withSignedInCodex(async (client) => {
    const models = [];
    const cursors = new Set();
    let cursor = null;

    do {
      const result = await client.request('model/list', { cursor, limit: 100, includeHidden: false });
      if (!Array.isArray(result?.data)) {
        throw new Error('Codex returned an invalid model list.');
      }
      for (const entry of result.data) {
        const model = entry?.model ?? entry?.id;
        if (typeof model !== 'string' || !model) {
          throw new Error('Codex returned an invalid model list.');
        }
        models.push(model);
      }
      cursor = result.nextCursor ?? null;
      if (cursor !== null && (typeof cursor !== 'string' || cursors.has(cursor))) {
        throw new Error('Codex returned invalid model-list pagination.');
      }
      if (cursor !== null) cursors.add(cursor);
    } while (cursor !== null);

    return models;
  });
}
