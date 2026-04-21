import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { parseTechnicalSolution } from '../src/parser.js';
import { buildFiles, generateProject } from '../src/service.js';
import type { TechnicalSolution } from '../src/types.js';

const solution: TechnicalSolution = {
  projectName: 'Lead MVP',
  modules: [
    {
      name: 'Lead Admin',
      entity: 'lead',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'phone', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'message', type: 'string' },
        { name: 'status', type: 'string', required: true }
      ]
    }
  ]
};

describe('code generation service', () => {
  test('buildFiles creates CRUD and page templates for each module', () => {
    const files = buildFiles(solution);
    expect(files).toHaveLength(4);
    expect(files.map((file) => file.path)).toEqual([
      'generated/backend/lead-admin/model.ts',
      'generated/backend/lead-admin/store.ts',
      'generated/backend/lead-admin/routes.ts',
      'generated/frontend/lead-admin/lead-admin.page.tsx'
    ]);
    expect(files[1].content).toContain('createLead');
    expect(files[2].content).toContain("app.patch('/api/leads/:id'");
    expect(files[3].content).toContain('Lead Admin Management');
  });

  test('generateProject writes files to disk', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'codegen-'));
    const generated = generateProject({ ...solution, outputDir });
    const targetFile = join(outputDir, generated[0].path);
    expect(existsSync(targetFile)).toBe(true);
    expect(readFileSync(targetFile, 'utf8')).toContain('export interface Lead');
  });

  test('parseTechnicalSolution supports markdown technical solution documents', () => {
    const markdown = `# 技术方案：线索收集官网与后台管理 MVP
### 模块 2：留资表单模块
字段：
- \`name\`
- \`phone\`
- \`company\`
- \`message\`
### 模块 4：后台管理模块
职责：
- 展示线索列表
- 支持修改状态
### 模块 5：接口模块
建议最小接口集合：`;

    const parsed = parseTechnicalSolution(markdown);
    expect(parsed.projectName).toContain('线索收集官网与后台管理 MVP');
    expect(parsed.modules).toHaveLength(3);
    expect(parsed.modules[0].fields.map((field) => field.name)).toContain('name');
    expect(parsed.modules[1].entity).toBe('adminLead');
    expect(parsed.modules[2].entity).toBe('lead');
  });
});
