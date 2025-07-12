import chalk from 'chalk';
import { askLocalLLM } from '../../utils/ollama.js';

export async function debug(input) {
  console.log(chalk.yellow.bold("\n[Debug Mode]\n"));
  console.log(chalk.cyan(input));

  try {
    const response = await askLocalLLM(`Find and fix bugs in this code:
\n${input}`);
    console.log(chalk.gray(`\n🤖 ${response}\n`));
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: ${err.message}`));
  }
}