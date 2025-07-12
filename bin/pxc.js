#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import chalk from 'chalk';
import { explain } from '../src/commands/explain.js';
import { debug } from '../src/commands/debug.js';
import { convert } from '../src/commands/convert.js';
import { refactor } from '../src/commands/refactor.js';

dotenv.config();

const program = new Command();
program.name("pxc").description("Perplexity-powered CLI for coding tasks").version("0.1.0");

const readInput = async (input) => {
  if (input) return input;
  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let data = '';
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data));
      process.stdin.on('error', reject);
    });
  }
  return null;
};

program
  .argument('[query]', 'Prompt or command')
  .option('-f, --file <path>', 'File to read input from')
  .action(async (query, options) => {
    const content = options.file ? fs.readFileSync(options.file, 'utf-8') : await readInput(query);
    if (!content) {
      console.log(chalk.red("❌ No input provided."));
      return;
    }

    if (query?.startsWith('/debug')) debug(content);
    else if (query?.startsWith('/convert')) convert(content);
    else if (query?.startsWith('/refactor')) refactor(content);
    else explain(content);
  });

program.parse(process.argv);