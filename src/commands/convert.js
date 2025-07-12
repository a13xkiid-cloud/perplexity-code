import chalk from 'chalk';
import { askLocalLLM } from '../../utils/ollama.js';

export async function convert(input) {
  console.log(chalk.magenta.bold("\n[Convert Mode]\n"));
  console.log(chalk.cyan(input));

  try {
    const response = await askLocalLLM(`Convert this code to another language and explain if needed:
\n${input}`);
    console.log(chalk.gray(`\n🤖 ${response}\n`));
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: ${err.message}`));
  }
}