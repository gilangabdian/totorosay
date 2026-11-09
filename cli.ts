#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { totorosay } from './index.js';

let input = process.argv.slice(2).join(' ');

if (!input && !process.stdin.isTTY) {
  try {
    input = readFileSync(0, 'utf-8').trim();
  } catch {
    // Fall back to default message if stdin read fails
  }
}

console.log(totorosay(input || 'Meow!'));
