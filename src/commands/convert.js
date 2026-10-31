import { runMode } from './run.js';

export async function convert(input, options = {}) {
  return runMode(input, options, {
    title: 'Convert',
    color: 'magenta',
    instruction: 'Convert this code to another language and explain if needed:',
  });
}