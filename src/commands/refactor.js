import chalk from 'chalk';
import { askLocalLLM } from '../../utils/ollama.js';

export async function refactor(input) {
  console.log(chalk.blue.bold("\n[Refactor Mode]\n"));
  console.log(chalk.cyan(input));

  try {
    const response = await askLocalLLM(`Refactor and improve this code:
\n${input}`);
    console.log(chalk.gray(`\n🤖 ${response}\n`));
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: ${err.message}`));
  }
}