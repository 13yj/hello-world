import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildFiles, generateProject } from '../src/service.js';
const solution = {
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
});
