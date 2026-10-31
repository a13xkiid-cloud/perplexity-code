import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/pxc.js', import.meta.url));

const fakeOllama = `
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args[0] === 'list') {
  console.log('NAME                 ID        SIZE      MODIFIED');
  console.log('first:latest         abc       1 GB      today');
  console.log('second:small         def       2 GB      today');
} else {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  writeFileSync(process.env.PXC_TEST_OLLAMA_LOG, JSON.stringify({
    args, input, gatewayKey: process.env.PXC_GATEWAY_API_KEY ?? null,
  }));
  if (process.env.PXC_TEST_FAIL) {
    console.error(process.env.PXC_TEST_SECRET);
    process.exitCode = 7;
  } else if (!process.env.PXC_TEST_EMPTY) {
    console.log('mock Ollama response');
  }
}
`;

const fakeCodex = `
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
const args = process.argv.slice(2);
const env = {
  codexHome: process.env.CODEX_HOME ?? null,
  openaiKey: process.env.OPENAI_API_KEY ?? null,
  openaiBase: process.env.OPENAI_BASE_URL ?? null,
  codexKey: process.env.CODEX_API_KEY ?? null,
  codexToken: process.env.CODEX_ACCESS_TOKEN ?? null,
  gatewayKey: process.env.PXC_GATEWAY_API_KEY ?? null,
};
if (args[0] === 'app-server') {
  writeFileSync(process.env.PXC_TEST_SERVER_LOG, JSON.stringify(env));
  const lines = createInterface({ input: process.stdin });
  for await (const line of lines) {
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    let result;
    if (request.method === 'initialize') {
      result = {};
    } else if (request.method === 'account/read') {
      result = { account: { type: process.env.PXC_TEST_ACCOUNT || 'chatgpt' } };
    } else if (request.method === 'model/list') {
      if (process.env.PXC_TEST_RPC_FAIL) {
        process.stdout.write(JSON.stringify({ id: request.id, error: { message: process.env.PXC_TEST_SECRET } }) + '\\n');
        continue;
      }
      result = request.params.cursor
        ? { data: [{ id: 'second-id', model: 'second-model' }], nextCursor: null }
        : { data: [{ id: 'first-id', model: 'first-model' }], nextCursor: 'next-page' };
    } else {
      process.stdout.write(JSON.stringify({ id: request.id, error: {} }) + '\\n');
      continue;
    }
    process.stdout.write(JSON.stringify({ id: request.id, result }) + '\\n');
  }
} else if (args[0] === 'exec') {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  writeFileSync(process.env.PXC_TEST_EXEC_LOG, JSON.stringify({ args, env, input }));
  console.log('mock Codex response');
} else {
  process.exitCode = 2;
}
`;

async function setup(t) {
  const dir = await mkdtemp(join(tmpdir(), 'pxc-test-'));
  const bin = join(dir, 'bin');
  await mkdir(bin);
  const ollamaScript = join(dir, 'fake-ollama.mjs');
  const codexScript = join(dir, 'fake-codex.mjs');
  await writeFile(ollamaScript, fakeOllama);
  await writeFile(codexScript, fakeCodex);
  await writeFile(join(bin, 'ollama'), '#!/bin/sh\nexec "$PXC_TEST_NODE" "$PXC_TEST_OLLAMA_SCRIPT" "$@"\n', { mode: 0o755 });
  await writeFile(join(bin, 'codex'), '#!/bin/sh\nexec "$PXC_TEST_NODE" "$PXC_TEST_CODEX_SCRIPT" "$@"\n', { mode: 0o755 });

  const env = { ...process.env };
  for (const key of [
    'PXC_PROVIDER', 'PXC_MODEL', 'PXC_GATEWAY_URL', 'PXC_GATEWAY_API_KEY',
    'PXC_CODEX_PATH', 'NODE_OPTIONS',
  ]) delete env[key];
  Object.assign(env, {
    HOME: dir,
    PATH: `${bin}${delimiter}${process.env.PATH || ''}`,
    ELECTRON_RUN_AS_NODE: '1',
    PXC_TEST_NODE: process.execPath,
    PXC_TEST_OLLAMA_SCRIPT: ollamaScript,
    PXC_TEST_CODEX_SCRIPT: codexScript,
    PXC_TEST_OLLAMA_LOG: join(dir, 'ollama.json'),
    PXC_TEST_SERVER_LOG: join(dir, 'codex-server.json'),
    PXC_TEST_EXEC_LOG: join(dir, 'codex-exec.json'),
    PXC_TEST_SECRET: 'test-secret-must-not-be-printed',
  });
  t.after(() => rm(dir, { recursive: true, force: true }));
  return { dir, bin, env };
}

function run(args, { env, dir, input = '', entrypoint = cli }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entrypoint, ...args], {
      cwd: dir,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
    child.stdin.on('error', reject);
    child.stdin.end(input);
  });
}

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function listen(t, handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.closeAllConnections();
    server.close(resolve);
  }));
  return `http://127.0.0.1:${server.address().port}/v1`;
}

test('help and version run without provider dependencies', async (t) => {
  const context = await setup(t);
  const help = await run(['--help'], context);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /--provider/);
  assert.match(help.stdout, /--list-models/);
  const version = await run(['--version'], context);
  assert.equal(version.code, 0);
  assert.equal(version.stdout.trim(), '0.1.2');
});

test('mode formatting uses the Node 20.12 string-only style API', async (t) => {
  const context = await setup(t);
  const entrypoint = join(context.dir, 'node20-style.mjs');
  await writeFile(entrypoint, `
import util from 'node:util';
import { syncBuiltinESMExports } from 'node:module';
const original = util.styleText;
util.styleText = (format, text) => {
  if (typeof format !== 'string') throw new TypeError('styleText format must be a string');
  return original(format, text);
};
syncBuiltinESMExports();
await import(${JSON.stringify(new URL('../bin/pxc.js', import.meta.url).href)});
`);
  const result = await run(['/debug', 'sample'], { ...context, entrypoint });
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Debug Mode/);
});

test('the default provider keeps the existing Ollama model and strips gateway credentials', async (t) => {
  const context = await setup(t);
  context.env.PXC_GATEWAY_API_KEY = 'test-gateway-secret';
  const result = await run(['What', 'is', 'a', 'function?'], context);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Explain Mode/);
  assert.match(result.stdout, /mock Ollama response/);
  const call = await json(context.env.PXC_TEST_OLLAMA_LOG);
  assert.deepEqual(call.args, ['run', 'deepseek-coder:base']);
  assert.match(call.input, /Explain this code in detail:\n\nWhat is a function\?/);
  assert.equal(call.gatewayKey, null);
});

test('model selection and slash commands pass the intended prompt', async (t) => {
  const context = await setup(t);
  const result = await run(['/debug', 'broken code', '--model', 'test-model:small'], context);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Debug Mode/);
  const call = await json(context.env.PXC_TEST_OLLAMA_LOG);
  assert.deepEqual(call.args, ['run', 'test-model:small']);
  assert.match(call.input, /Find and fix bugs in this code:\n\nbroken code/);
  assert.doesNotMatch(call.input, /\/debug/);
});

test('file input and piped standard input select the requested modes', async (t) => {
  const context = await setup(t);
  const path = join(context.dir, 'sample.txt');
  await writeFile(path, 'source from file');
  let result = await run(['/convert', 'ignored prompt', '--file', path], context);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Convert Mode/);
  let call = await json(context.env.PXC_TEST_OLLAMA_LOG);
  assert.match(call.input, /source from file/);
  assert.doesNotMatch(call.input, /ignored prompt/);

  result = await run(['/refactor'], { ...context, input: 'source from stdin' });
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Refactor Mode/);
  call = await json(context.env.PXC_TEST_OLLAMA_LOG);
  assert.match(call.input, /source from stdin/);
});

test('inline slash commands and local .env settings work', async (t) => {
  const context = await setup(t);
  await writeFile(join(context.dir, '.env'), 'PXC_PROVIDER=ollama\nPXC_MODEL=local:model\n');
  const result = await run(['/explain inline input'], context);
  assert.equal(result.code, 0, result.stderr);
  const call = await json(context.env.PXC_TEST_OLLAMA_LOG);
  assert.deepEqual(call.args, ['run', 'local:model']);
  assert.match(call.input, /\n\ninline input/);

  const overridden = await run(['--provider', 'ollama', '--model', 'chosen:model', 'explicit input'], {
    ...context,
    env: { ...context.env, PXC_PROVIDER: 'gateway' },
  });
  assert.equal(overridden.code, 0, overridden.stderr);
  assert.deepEqual((await json(context.env.PXC_TEST_OLLAMA_LOG)).args, ['run', 'chosen:model']);
});

test('Ollama model listing returns actual IDs from the local CLI', async (t) => {
  const context = await setup(t);
  const result = await run(['--list-models'], context);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split('\n'), ['first:latest', 'second:small']);
  assert.equal(existsSync(context.env.PXC_TEST_OLLAMA_LOG), false);
});

test('invalid input and missing executables fail explicitly', async (t) => {
  const context = await setup(t);
  for (const args of [
    [],
    ['--provider', 'unknown', 'hello'],
    ['--model=--invalid', 'hello'],
    ['--file='],
    ['--not-a-real-option'],
  ]) {
    const result = await run(args, context);
    assert.notEqual(result.code, 0, JSON.stringify(args));
    assert.match(result.stderr, /Error:/);
  }
  const missing = await run(['hello'], {
    ...context,
    env: { ...context.env, PATH: join(context.dir, 'missing') },
  });
  assert.notEqual(missing.code, 0);
  assert.match(missing.stderr, /Ollama was not found/);
});

test('Ollama failures and empty responses never appear successful or leak stderr', async (t) => {
  const context = await setup(t);
  let result = await run(['hello'], {
    ...context,
    env: { ...context.env, PXC_TEST_FAIL: '1' },
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /exit code 7/);
  assert.doesNotMatch(result.stderr, /test-secret-must-not-be-printed/);

  result = await run(['hello'], {
    ...context,
    env: { ...context.env, PXC_TEST_EMPTY: '1' },
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /empty response/);
});

test('gateway lists models and sends a selected model and local client key', async (t) => {
  const context = await setup(t);
  const requests = [];
  const url = await listen(t, async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    requests.push({ path: req.url, authorization: req.headers.authorization, body });
    res.setHeader('content-type', 'application/json');
    if (req.url === '/v1/models') {
      res.end(JSON.stringify({ data: [{ id: 'available-model' }] }));
    } else {
      res.end(JSON.stringify({ choices: [{ message: { content: 'gateway answer' } }] }));
    }
  });
  context.env.PXC_GATEWAY_URL = url;
  context.env.PXC_GATEWAY_API_KEY = 'local-client-key';

  const listed = await run(['--provider', 'gateway', '--list-models'], context);
  assert.equal(listed.code, 0, listed.stderr);
  assert.equal(listed.stdout.trim(), 'available-model');
  const answer = await run(['--provider', 'gateway', '--model', 'available-model', 'hello'], context);
  assert.equal(answer.code, 0, answer.stderr);
  assert.match(answer.stdout, /gateway answer/);
  assert.equal(requests[0].authorization, 'Bearer local-client-key');
  assert.equal(requests[1].authorization, 'Bearer local-client-key');
  assert.equal(JSON.parse(requests[1].body).model, 'available-model');
  assert.match(JSON.parse(requests[1].body).messages[0].content, /hello/);
});

test('gateway requires an explicit model and a local, credential-free URL', async (t) => {
  const context = await setup(t);
  context.env.PXC_GATEWAY_URL = 'https://example.com/v1';
  let result = await run(['--provider', 'gateway', '--model', 'model', 'hello'], context);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /must be a local URL/);

  context.env.PXC_GATEWAY_URL = 'http://user:password@127.0.0.1/v1';
  result = await run(['--provider', 'gateway', '--list-models'], context);
  assert.notEqual(result.code, 0);
  assert.doesNotMatch(result.stderr, /password/);

  context.env.PXC_GATEWAY_URL = 'http://127.0.0.1:1234/v1';
  result = await run(['--provider', 'gateway', 'hello'], context);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /gateway model is required/);
});

test('gateway error bodies and redirect targets do not expose the client key', async (t) => {
  const context = await setup(t);
  let redirected = 0;
  const destination = await listen(t, (_req, res) => {
    redirected++;
    res.end('{}');
  });
  const url = await listen(t, (req, res) => {
    if (req.url === '/v1/models') {
      res.writeHead(302, { location: `${destination}/models` });
      res.end();
    } else {
      res.writeHead(401);
      res.end('test-secret-must-not-be-printed');
    }
  });
  context.env.PXC_GATEWAY_URL = url;
  context.env.PXC_GATEWAY_API_KEY = 'test-secret-must-not-be-printed';

  let result = await run(['--provider', 'gateway', '--list-models'], context);
  assert.notEqual(result.code, 0);
  assert.equal(redirected, 0);
  assert.doesNotMatch(result.stderr, /test-secret-must-not-be-printed/);
  result = await run(['--provider', 'gateway', '--model', 'model', 'hello'], context);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /HTTP 401/);
  assert.doesNotMatch(result.stderr, /test-secret-must-not-be-printed/);
});

test('Codex uses a separate ChatGPT profile and does not inherit API credentials', { timeout: 10_000 }, async (t) => {
  const context = await setup(t);
  Object.assign(context.env, {
    CODEX_HOME: join(context.dir, 'surrounding-profile'),
    OPENAI_API_KEY: 'test-openai-key',
    OPENAI_BASE_URL: 'https://example.com',
    CODEX_API_KEY: 'test-codex-key',
    CODEX_ACCESS_TOKEN: 'test-codex-token',
    PXC_GATEWAY_API_KEY: 'test-gateway-key',
  });
  const result = await run(['--provider', 'codex', '--model', 'actual-model', 'hello'], context);
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /mock Codex response/);
  const server = await json(context.env.PXC_TEST_SERVER_LOG);
  const execution = await json(context.env.PXC_TEST_EXEC_LOG);
  assert.ok((await stat(server.codexHome)).isDirectory());
  for (const env of [server, execution.env]) {
    assert.equal(env.codexHome, await realpath(join(context.dir, '.perplexity-code', 'codex')));
    assert.equal(env.openaiKey, null);
    assert.equal(env.openaiBase, null);
    assert.equal(env.codexKey, null);
    assert.equal(env.codexToken, null);
    assert.equal(env.gatewayKey, null);
  }
  assert.ok(execution.args.includes('read-only'));
  assert.ok(execution.args.includes('--ephemeral'));
  assert.ok(execution.args.includes('--skip-git-repo-check'));
  assert.equal(execution.args[execution.args.indexOf('--model') + 1], 'actual-model');
  assert.match(execution.input, /hello/);
});

test('Codex rejects a dedicated profile that aliases the surrounding profile', { timeout: 10_000 }, async (t) => {
  const context = await setup(t);
  const surrounding = join(context.dir, '.codex');
  await mkdir(surrounding);
  await mkdir(join(context.dir, '.perplexity-code'));
  await symlink(surrounding, join(context.dir, '.perplexity-code', 'codex'));
  const result = await run(['--provider', 'codex', '--list-models'], context);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /must be separate/);
  assert.equal(existsSync(context.env.PXC_TEST_SERVER_LOG), false);
});

test('Codex model discovery handles pagination without inventing model IDs', { timeout: 10_000 }, async (t) => {
  const context = await setup(t);
  const result = await run(['--provider', 'codex', '--list-models'], context);
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split('\n'), ['first-model', 'second-model']);
  assert.equal(existsSync(context.env.PXC_TEST_EXEC_LOG), false);
});

test('Codex refuses API-key profiles and hides app-server error details', { timeout: 10_000 }, async (t) => {
  const context = await setup(t);
  let result = await run(['--provider', 'codex', 'hello'], {
    ...context,
    env: { ...context.env, PXC_TEST_ACCOUNT: 'apiKey' },
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /API-key profiles are not supported/);
  assert.equal(existsSync(context.env.PXC_TEST_EXEC_LOG), false);

  result = await run(['--provider', 'codex', '--list-models'], {
    ...context,
    env: { ...context.env, PXC_TEST_RPC_FAIL: '1' },
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /model\/list/);
  assert.doesNotMatch(result.stderr, /test-secret-must-not-be-printed/);
});
