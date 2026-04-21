import type { FieldDefinition, ModuleDefinition, TechnicalSolution } from './types.js';

const DEFAULT_FIELD: FieldDefinition = { name: 'name', type: 'string', required: true };

const normalizeModuleName = (title: string): string => title.replace(/^模块\s*\d+[:：]\s*/, '').trim();

const inferEntity = (moduleName: string): string => {
  if (/线索/.test(moduleName)) return 'lead';
  if (/官网/.test(moduleName)) return 'site';
  if (/后台/.test(moduleName)) return 'adminLead';
  if (/接口/.test(moduleName)) return 'lead';
  return moduleName.replace(/模块|管理|展示/g, '').trim() || 'item';
};

const dedupeFields = (fields: FieldDefinition[]): FieldDefinition[] => {
  const map = new Map<string, FieldDefinition>();
  for (const field of fields) map.set(field.name, field);
  return [...map.values()];
};

const extractFieldNames = (markdown: string): FieldDefinition[] => {
  const matches = [...markdown.matchAll(/-\s*`([^`]+)`/g)].map((match) => match[1].trim());
  return dedupeFields(
    matches.map((name) => ({
      name,
      type: 'string' as const,
      required: name === 'name' || name === 'phone' || name === 'status'
    }))
  );
};

const extractSections = (markdown: string): Array<{ title: string; body: string }> => {
  const matches = [...markdown.matchAll(/^###\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? markdown.length : markdown.length;
    return {
      title: match[1].trim(),
      body: markdown.slice(start, end)
    };
  });
};

export const parseTechnicalSolution = (input: string, outputDir?: string): TechnicalSolution => {
  const trimmed = input.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed) as TechnicalSolution;

  const projectNameMatch = trimmed.match(/^#\s+(.+)$/m);
  const projectName = projectNameMatch?.[1]?.replace(/^技术方案[:：]\s*/, '').trim() || 'Generated Project';
  const sections = extractSections(trimmed);
  const globalFields = extractFieldNames(trimmed);

  const modules: ModuleDefinition[] = sections.map((section) => {
    const title = normalizeModuleName(section.title);
    const fields = extractFieldNames(section.body);
    const moduleFields = fields.length > 0 ? fields : /线索|接口|后台/.test(title) ? globalFields : [];
    return {
      name: title,
      entity: inferEntity(title),
      fields: moduleFields.length > 0 ? moduleFields : [DEFAULT_FIELD],
      features: [...section.body.matchAll(/-\s+([^`\n][^\n]*)/g)].map((match) => match[1].trim())
    };
  });

  return {
    projectName,
    outputDir,
    modules: modules.length > 0 ? modules : [{ name: 'Default Module', entity: 'item', fields: globalFields.length > 0 ? globalFields : [DEFAULT_FIELD] }]
  };
};
