const upperFirst = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
const toPascalCase = (value: string): string => value.split(/[-\s_]+/).filter(Boolean).map((part) => upperFirst(part)).join('');
const toLabel = (value: string): string => value.split(/[-_]+/).filter(Boolean).map((part) => upperFirst(part)).join(' ');

const toTypeLiteral = (fields: { name: string; type: string; required?: boolean }[]): string => fields.map((field) => `  ${field.name}${field.required ? '' : '?'}: ${field.type};`).join('\n');

const toJsonShape = (fields: { name: string }[]): string => fields.map((field) => `      ${field.name}: payload.${field.name},`).join('\n');

export const renderModel = (entity: string, fields: { name: string; type: string; required?: boolean }[]): string => `export interface ${upperFirst(entity)} {\n  id: string;\n${toTypeLiteral(fields)}\n  createdAt: string;\n  updatedAt: string;\n}\n`;

export const renderStore = (entity: string, fields: { name: string; type: string; required?: boolean }[]): string => {
  const entityName = upperFirst(entity);
  const payloadType = `${entityName}Payload`;
  return `import { randomUUID } from 'node:crypto';\nimport type { ${entityName} } from './model.js';\n\nexport interface ${payloadType} {\n${toTypeLiteral(fields)}\n}\n\nconst items: ${entityName}[] = [];\n\nexport const list${entityName}s = (): ${entityName}[] => items;\n\nexport const create${entityName} = (payload: ${payloadType}): ${entityName} => {\n  const now = new Date().toISOString();\n  const item: ${entityName} = {\n    id: randomUUID(),\n${toJsonShape(fields)}\n    createdAt: now,\n    updatedAt: now\n  };\n\n  items.push(item);\n  return item;\n};\n\nexport const update${entityName} = (id: string, payload: Partial<${payloadType}>): ${entityName} | null => {\n  const item = items.find((current) => current.id === id);\n  if (!item) return null;\n\n  Object.assign(item, payload, { updatedAt: new Date().toISOString() });\n  return item;\n};\n\nexport const delete${entityName} = (id: string): boolean => {\n  const index = items.findIndex((current) => current.id === id);\n  if (index < 0) return false;\n  items.splice(index, 1);\n  return true;\n};\n`;
};

export const renderRoute = (entity: string): string => {
  const entityName = upperFirst(entity);
  const collection = `${entity}s`;
  return `import { create${entityName}, delete${entityName}, list${entityName}s, update${entityName} } from './store.js';\n\nexport const register${entityName}Routes = (app: { get: Function; post: Function; patch: Function; delete: Function }) => {\n  app.get('/api/${collection}', async () => list${entityName}s());\n  app.post('/api/${collection}', async (request: { body: unknown }) => create${entityName}(request.body as never));\n  app.patch('/api/${collection}/:id', async (request: { params: { id: string }; body: unknown }) => update${entityName}(request.params.id, request.body as never));\n  app.delete('/api/${collection}/:id', async (request: { params: { id: string } }) => ({ success: delete${entityName}(request.params.id) }));\n};\n`;
};

export const renderPage = (moduleName: string, entity: string, fields: { name: string; required?: boolean }[]): string => `import { useState } from 'react';\n\nconst initialState = {\n${fields.map((field) => `  ${field.name}: ''`).join(',\n')}\n};\n\nexport const ${toPascalCase(moduleName)}Page = () => {\n  const [form, setForm] = useState(initialState);\n\n  return (\n    <main>\n      <h1>${toLabel(moduleName)} Management</h1>\n      <form>\n${fields.map((field) => `        <label>\n          ${toLabel(field.name)}${field.required ? ' *' : ''}\n          <input name=\"${field.name}\" value={form.${field.name}} onChange={(event) => setForm({ ...form, ${field.name}: event.target.value })} />\n        </label>`).join('\n')}\n        <button type=\"submit\">Create ${toPascalCase(entity)}</button>\n      </form>\n    </main>\n  );\n};\n`;
