import { runMode } from './run.js';

export async function debug(input, options = {}) {
  return runMode(input, options, {
    title: 'Debug',
    color: 'yellow',
    instruction: 'Find and fix bugs in this code:',
  });
}