import { styleText } from 'node:util';
import { askProvider } from '../../utils/providers.js';

export async function runMode(input, options, { title, color, instruction }) {
  console.log(styleText(color, styleText('bold', `\n[${title} Mode]\n`)));
  console.log(styleText('cyan', input));
  const response = await askProvider(`${instruction}\n\n${input}`, options);
  console.log(styleText('gray', `\n🤖 ${response}\n`));
}
