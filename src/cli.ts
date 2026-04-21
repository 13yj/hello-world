import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateProject } from './service.js';
import { parseTechnicalSolution } from './parser.js';

const configPath = process.argv[2];

if (!configPath) {
  throw new Error('Usage: npm run generate -- <technical-solution.json>');
}

const source = readFileSync(resolve(configPath), 'utf8');
const solution = parseTechnicalSolution(source);
const result = generateProject(solution);
console.log(JSON.stringify({ generated: result.length }, null, 2));
