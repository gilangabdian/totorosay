import { catsay } from './index.js';

const input = process.argv.slice(2).join(' ') || 'Meow!';

console.log(catsay(input));
