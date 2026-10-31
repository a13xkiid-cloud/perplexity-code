import { runMode } from './run.js';

export async function refactor(input, options = {}) {
  return runMode(input, options, {
    title: 'Refactor',
    color: 'blue',
    instruction: 'Refactor and improve this code:',
  });
}