import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { renderModel, renderPage, renderRoute, renderStore } from './templates.js';
import type { GeneratedFile, TechnicalSolution } from './types.js';

const normalizeSegment = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '-');

export const buildFiles = (solution: TechnicalSolution): GeneratedFile[] => {
  return solution.modules.flatMap((module) => {
    const base = normalizeSegment(module.name);
    const entity = normalizeSegment(module.entity).replace(/-/g, '');
    return [
      {
        path: `generated/backend/${base}/model.ts`,
        content: renderModel(entity, module.fields)
      },
      {
        path: `generated/backend/${base}/store.ts`,
        content: renderStore(entity, module.fields)
      },
      {
        path: `generated/backend/${base}/routes.ts`,
        content: renderRoute(entity)
      },
      {
        path: `generated/frontend/${base}/${base}.page.tsx`,
        content: renderPage(base, entity, module.fields)
      }
    ];
  });
};

export const generateProject = (solution: TechnicalSolution): GeneratedFile[] => {
  const files = buildFiles(solution);
  const root = solution.outputDir ?? process.cwd();

  for (const file of files) {
    const targetPath = join(root, file.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, file.content, 'utf8');
  }

  return files;
};
