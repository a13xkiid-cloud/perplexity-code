import chalk from 'chalk';

export function explain(input) {
  console.log(chalk.green.bold("\n[Explain Mode]\n"));
  console.log(chalk.cyan(input));
  console.log(chalk.gray("\n🤖 AI: This is a placeholder explanation for your input."));
}