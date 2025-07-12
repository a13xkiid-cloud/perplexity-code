import chalk from 'chalk';
import { askLocalLLM } from '../../utils/ollama.js';

export async function explain(input) {
  console.log(chalk.green.bold("\n[Explain Mode]\n"));
  console.log(chalk.cyan(input));

  try {
    const response = await askLocalLLM(`Explain this code in detail:
\n${input}`);
    console.log(chalk.gray(`\n🤖 ${response}\n`));
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: ${err.message}`));
  }
}