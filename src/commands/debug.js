import chalk from 'chalk';

export function debug(input) {
  console.log(chalk.yellow.bold("\n[Debug Mode]\n"));
  console.log(chalk.cyan(input));
  console.log(chalk.gray("\n🤖 AI: This is a placeholder debug explanation."));
}