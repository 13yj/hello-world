import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateProject } from './service.js';
import type { TechnicalSolution } from './types.js';

const configPath = process.argv[2];

if (!configPath) {
  throw new Error('Usage: npm run generate -- <technical-solution.json>');
}

const solution = JSON.parse(readFileSync(resolve(configPath), 'utf8')) as TechnicalSolution;
const result = generateProject(solution);
console.log(JSON.stringify({ generated: result.length }, null, 2));
