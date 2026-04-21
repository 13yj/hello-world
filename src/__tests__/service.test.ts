/**
 * Tests for the code generation service
 */

import { describe, it, expect } from 'vitest'
import { parseDocument } from '../parsers/document-parser.js'
import { generateCrud, toPascalCase, toCamelCase, toKebabCase } from '../generators/crud-generator.js'
import { generatePageTemplate } from '../generators/page-generator.js'
import { generateCode } from '../service.js'

const SAMPLE_DOC = `# 技术方案：线索收集官网与后台管理 MVP

## 3. 推荐技术栈

- 前端：React + TypeScript + Vite
- 后端：Node.js + Fastify + TypeScript
- 数据存储：本地 JSON 文件
- 样式：原生 CSS
- 测试：Vitest

## 4. 功能模块拆分

### 模块 1：官网展示模块

职责：

- 提供一个官网首页
- 展示产品标题、卖点、咨询入口

建议实现：

- 一个首页路由
- 一个介绍区域

### 模块 2：留资表单模块

职责：

- 收集用户提交的线索信息
- 做基础前端校验
- 调用后端提交接口

字段：

\`\`\`typescript
interface LeadForm {
  name: string
  phone: string
  company: string
  message: string
}
\`\`\`

### 模块 3：线索存储模块

职责：

- 保存线索数据
- 提供线索查询能力
- 支持状态更新

\`\`\`typescript
interface LeadItem {
  id: string
  name: string
  phone: string
  company: string
  message: string
  status: LeadStatus
  createdAt: string
  updatedAt: string
}
\`\`\`

### 模块 4：后台管理模块

职责：

- 展示线索列表
- 展示基础字段
- 支持修改状态

## 5. 接口模块

\`POST /api/leads\`
  - 创建线索

\`GET /api/admin/leads\`
  - 获取线索列表

\`PATCH /api/admin/leads/:id/status\`
  - 更新线索状态

## 6. 实现约束

1. 不新增复杂基础设施。
2. 不做登录权限。
3. 不做部署脚本和云资源编排。
`

describe('Document Parser', () => {
  it('should parse document title', () => {
    const doc = parseDocument(SAMPLE_DOC)
    expect(doc.title).toBe('技术方案：线索收集官网与后台管理 MVP')
  })

  it('should extract tech stack', () => {
    const doc = parseDocument(SAMPLE_DOC)
    expect(doc.techStack.frontend).toContain('React')
    expect(doc.techStack.backend).toContain('Fastify')
    expect(doc.techStack.testing).toContain('Vitest')
  })

  it('should extract modules', () => {
    const doc = parseDocument(SAMPLE_DOC)
    expect(doc.modules.length).toBeGreaterThanOrEqual(2)
  })

  it('should extract fields from typescript code blocks', () => {
    const doc = parseDocument(SAMPLE_DOC)
    const formModule = doc.modules.find((m) => m.name.includes('留资表单'))
    expect(formModule).toBeDefined()
    expect(formModule!.fields).toBeDefined()
    expect(formModule!.fields!.length).toBeGreaterThan(0)
  })

  it('should extract constraints', () => {
    const doc = parseDocument(SAMPLE_DOC)
    expect(doc.constraints.length).toBeGreaterThan(0)
    expect(doc.constraints[0]).toContain('不新增')
  })
})

describe('CRUD Generator', () => {
  it('should generate model, store, and route files for module with fields', () => {
    const module = {
      name: '线索存储',
      description: 'Lead storage module',
      responsibilities: ['保存线索数据'],
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'phone', type: 'string', required: true },
        { name: 'company', type: 'string', required: false },
      ],
    }
    const files = generateCrud(module)
    expect(files.length).toBe(3)
    expect(files.map((f) => f.type)).toContain('model')
    expect(files.map((f) => f.type)).toContain('route')
  })

  it('should return empty array for module without fields', () => {
    const module = {
      name: '官网展示',
      description: 'Homepage module',
      responsibilities: ['展示产品'],
    }
    const files = generateCrud(module)
    expect(files.length).toBe(0)
  })
})

describe('Page Generator', () => {
  it('should generate a form page for form-related module', () => {
    const module = {
      name: '留资表单',
      description: 'Lead form module',
      responsibilities: ['收集用户提交的线索信息'],
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'phone', type: 'string', required: true },
      ],
    }
    const files = generatePageTemplate(module)
    const formFile = files.find((f) => f.path.includes('form'))
    expect(formFile).toBeDefined()
    expect(formFile!.content).toContain('handleSubmit')
  })

  it('should generate a list page for list-related module', () => {
    const module = {
      name: '后台管理',
      description: 'Admin module',
      responsibilities: ['展示线索列表'],
    }
    const files = generatePageTemplate(module)
    const listFile = files.find((f) => f.path.includes('list'))
    expect(listFile).toBeDefined()
    expect(listFile!.content).toContain('fetchItems')
  })

  it('should generate a basic page for generic module', () => {
    const module = {
      name: '官网展示',
      description: 'Homepage',
      responsibilities: ['提供一个官网首页'],
      components: ['介绍区域'],
    }
    const files = generatePageTemplate(module)
    expect(files.length).toBeGreaterThan(0)
    const pageFile = files.find((f) => f.type === 'component')
    expect(pageFile).toBeDefined()
  })
})

describe('Service - generateCode', () => {
  it('should generate code from a document', () => {
    const result = generateCode({ document: SAMPLE_DOC })
    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
    expect(result.summary).toContain('Generated')
  })

  it('should filter modules by name', () => {
    const result = generateCode({ document: SAMPLE_DOC, modules: ['留资表单'] })
    expect(result.success).toBe(true)
  })

  it('should handle empty document gracefully', () => {
    const result = generateCode({ document: '' })
    expect(result).toBeDefined()
  })
})

describe('Name converters', () => {
  it('toPascalCase', () => {
    expect(toPascalCase('线索存储')).toBe('线索存储')
    expect(toPascalCase('hello world')).toBe('HelloWorld')
    expect(toPascalCase('lead-form')).toBe('LeadForm')
  })

  it('toCamelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
  })

  it('toKebabCase', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
  })
})
