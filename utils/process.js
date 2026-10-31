import { spawn } from 'node:child_process';

export function childEnvironment({ codexHome } = {}) {
  const env = { ...process.env };
  delete env.PXC_GATEWAY_API_KEY;

  if (codexHome) {
    env.CODEX_HOME = codexHome;
    for (const key of [
      'OPENAI_API_KEY',
      'OPENAI_BASE_URL',
      'CODEX_API_KEY',
      'CODEX_ACCESS_TOKEN',
    ]) {
      delete env[key];
    }
  }

  return env;
}

export function runExternal(command, args, { input, env, name }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let output = '';
    let inputFailed = false;
    let outputFailed = false;
    let settled = false;
    const fail = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    child.once('error', (error) => {
      fail(new Error(
        error.code === 'ENOENT'
          ? `${name} was not found. Install it or make it available on PATH.`
          : `Could not start ${name}.`,
      ));
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stdout.on('error', () => { outputFailed = true; });
    child.stderr.on('error', () => { outputFailed = true; });
    child.stderr.resume();
    child.stdin.on('error', () => { inputFailed = true; });
    child.once('close', (code, signal) => {
      if (settled) return;
      if (code !== 0) {
        const status = signal ? `signal ${signal}` : `exit code ${code}`;
        fail(new Error(`${name} failed (${status}). Check its setup and try again.`));
      } else if (inputFailed || outputFailed) {
        fail(new Error(`Could not exchange data with ${name}.`));
      } else {
        settled = true;
        resolve(output.trim());
      }
    });

    child.stdin.end(input);
  });
}
