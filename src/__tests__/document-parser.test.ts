/**
 * Tests for the document parser
 */

import { describe, it, expect } from 'vitest'
import { parseDocument } from '../parsers/document-parser.js'

const sampleDoc = `# 技术方案：线索收集官网与后台管理 MVP

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
interface LeadItem {
  name: string
  phone: string
  company: string
  message: string
  status: LeadStatus
}
\`\`\`

要求：

- name 和 phone 必填

### 模块 3：线索存储模块

职责：

- 保存线索数据
- 提供线索查询能力
- 支持状态更新

### 模块 4：后台管理模块

职责：

- 展示线索列表
- 展示基础字段
- 支持修改状态

### 模块 5：接口模块

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

describe('parseDocument', () => {
  it('should extract the document title', () => {
    const doc = parseDocument(sampleDoc)
    expect(doc.title).toBe('技术方案：线索收集官网与后台管理 MVP')
  })

  it('should extract tech stack configuration', () => {
    const doc = parseDocument(sampleDoc)
    expect(doc.techStack.frontend).toContain('React')
    expect(doc.techStack.backend).toContain('Fastify')
    expect(doc.techStack.storage).toContain('JSON')
    expect(doc.techStack.testing).toContain('Vitest')
  })

  it('should extract modules', () => {
    const doc = parseDocument(sampleDoc)
    expect(doc.modules.length).toBeGreaterThanOrEqual(3)
    expect(doc.modules[0].name).toContain('官网展示')
  })

  it('should extract responsibilities from modules', () => {
    const doc = parseDocument(sampleDoc)
    const homeModule = doc.modules.find((m) => m.name.includes('官网'))
    expect(homeModule).toBeDefined()
    expect(homeModule!.responsibilities.length).toBeGreaterThan(0)
  })

  it('should extract fields from code blocks', () => {
    const doc = parseDocument(sampleDoc)
    const formModule = doc.modules.find((m) => m.name.includes('留资'))
    expect(formModule).toBeDefined()
    expect(formModule!.fields).toBeDefined()
    expect(formModule!.fields!.length).toBeGreaterThan(0)
    expect(formModule!.fields!.some((f) => f.name === 'name')).toBe(true)
  })

  it('should extract constraints', () => {
    const doc = parseDocument(sampleDoc)
    expect(doc.constraints.length).toBeGreaterThan(0)
    expect(doc.constraints[0]).toContain('复杂基础设施')
  })

  it('should handle empty document gracefully', () => {
    const doc = parseDocument('')
    expect(doc.title).toBe('Untitled Document')
    expect(doc.modules).toEqual([])
    expect(doc.routes).toEqual([])
  })
})
