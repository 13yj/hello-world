/**
 * Technical document parser
 * Parses markdown-formatted technical documents into structured module definitions
 */

import type {
  TechDocument,
  ModuleDefinition,
  FieldDefinition,
  RouteDefinition,
  TechStackConfig,
} from '../types.js'

/**
 * Parse a technical document in markdown format and extract module definitions
 */
export function parseDocument(markdown: string): TechDocument {
  const title = extractTitle(markdown)
  const techStack = extractTechStack(markdown)
  const modules = extractModules(markdown)
  const routes = extractRoutes(markdown)
  const constraints = extractConstraints(markdown)

  return { title, modules, techStack, routes, constraints }
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled Document'
}

function escapeRegExp(str: string): string {
  return str.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSection(markdown: string, heading: string): string | null {
  const escaped = escapeRegExp(heading)
  const re = new RegExp('##\\s+\\d*\\.?\\s*' + escaped + '[\\s\\S]*?(?=\\n##\\s|$)', 'i')
  const m = markdown.match(re)
  return m ? m[0] : null
}

function extractSubSection(block: string, heading: string): string | null {
  const idx = block.indexOf(heading)
  if (idx === -1) return null
  const after = block.slice(idx + heading.length + 1)
  const next = after.search(/\n\S/)
  return next === -1 ? after : after.slice(0, next)
}

function extractTechStack(markdown: string): TechStackConfig {
  const defaults: TechStackConfig = {
    frontend: 'React + TypeScript + Vite',
    backend: 'Node.js + Fastify + TypeScript',
    storage: 'JSON file',
    styling: 'CSS',
    testing: 'Vitest',
  }
  const section = extractSection(markdown, '推荐技术栈')
  if (!section) return defaults

  const fe = section.match(/前端[：:]\s*(.+)/i)
  const be = section.match(/后端[：:]\s*(.+)/i)
  const st = section.match(/数据存储[：:]\s*(.+)/i)
  const sy = section.match(/样式[：:]\s*(.+)/i)
  const te = section.match(/测试[：:]\s*(.+)/i)

  return {
    frontend: fe?.[1]?.trim() || defaults.frontend,
    backend: be?.[1]?.trim() || defaults.backend,
    storage: st?.[1]?.trim() || defaults.storage,
    styling: sy?.[1]?.trim() || defaults.styling,
    testing: te?.[1]?.trim() || defaults.testing,
  }
}

function extractModules(markdown: string): ModuleDefinition[] {
  const modules: ModuleDefinition[] = []
  const section = extractSection(markdown, '功能模块拆分')
  if (!section) return modules

  const blocks = section.split(/###\s+模块\s*\d+[：:]\s*/)
  for (const block of blocks) {
    if (!block.trim()) continue
    const mod = parseModuleBlock(block)
    if (mod) modules.push(mod)
  }
  return modules
}

function parseModuleBlock(block: string): ModuleDefinition | null {
  const lines = block.split('\n')
  const name = lines[0]?.trim()
  if (!name) return null

  const responsibilities: string[] = []
  const fields: FieldDefinition[] = []
  const components: string[] = []

  const dutySection = extractSubSection(block, '职责')
  if (dutySection) {
    for (const line of dutySection.split('\n')) {
      const m = line.match(/^-\s+(.+)/)
      if (m) responsibilities.push(m[1].trim())
    }
  }

  const fieldBlock = block.match(/```typescript\n([\s\S]*?)```/)
  if (fieldBlock) {
    for (const line of fieldBlock[1].split('\n')) {
      const fm = line.match(/^\s+(\w+)(\??):\s+(.+)/)
      if (fm) {
        fields.push({
          name: fm[1],
          type: fm[3].trim(),
          required: fm[2] !== '?',
        })
      }
    }
  }

  const implSection = extractSubSection(block, '建议实现')
  if (implSection) {
    for (const line of implSection.split('\n')) {
      const m = line.match(/^-\s+(.+)/)
      if (m) components.push(m[1].trim())
    }
  }

  return {
    name,
    description: name,
    responsibilities,
    fields: fields.length > 0 ? fields : undefined,
    components: components.length > 0 ? components : undefined,
  }
}

function extractRoutes(markdown: string): RouteDefinition[] {
  const routes: RouteDefinition[] = []
  const section = extractSection(markdown, '接口模块')
  if (!section) return routes

  const re = /`(GET|POST|PUT|PATCH|DELETE)\s+([^`]+)`\s*\n\s*-\s*(.+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(section)) !== null) {
    routes.push({
      method: m[1] as RouteDefinition['method'],
      path: m[2].trim(),
      description: m[3].trim(),
    })
  }
  return routes
}

function extractConstraints(markdown: string): string[] {
  const constraints: string[] = []
  const section = extractSection(markdown, '实现约束')
  if (!section) return constraints

  for (const line of section.split('\n')) {
    const m = line.match(/^\d+\.\s+(.+)/)
    if (m) constraints.push(m[1].trim())
  }
  return constraints
}
