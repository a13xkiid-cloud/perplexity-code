// utils/ollama.js
import { spawn } from 'child_process';

export async function askLocalLLM(prompt) {
  return new Promise((resolve, reject) => {
    const process = spawn('ollama', ['run', 'deepseek-coder:base']);

    let output = '';
    process.stdout.on('data', (data) => output += data.toString());
    process.stderr.on('data', (err) => console.error('stderr:', err.toString()));
    process.on('close', () => resolve(output.trim()));

    process.stdin.write(prompt + '\n');
    process.stdin.end();
  });
}