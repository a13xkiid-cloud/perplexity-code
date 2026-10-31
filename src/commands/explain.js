import { runMode } from './run.js';

export async function explain(input, options = {}) {
  return runMode(input, options, {
    title: 'Explain',
    color: 'green',
    instruction: 'Explain this code in detail:',
  });
}