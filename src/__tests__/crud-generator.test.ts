/**
 * Tests for the CRUD generator
 */

import { describe, it, expect } from 'vitest'
import { generateCrud, toPascalCase, toCamelCase, toKebabCase } from '../generators/crud-generator.js'
import type { ModuleDefinition } from '../types.js'

describe('generateCrud', () => {
  const testModule: ModuleDefinition = {
    name: '线索存储',
    description: '线索存储模块',
    responsibilities: ['保存线索数据', '提供线索查询能力'],
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'phone', type: 'string', required: true },
      { name: 'company', type: 'string', required: false },
      { name: 'status', type: 'string', required: true },
    ],
  }

  it('should generate model, store, and route files', () => {
    const files = generateCrud(testModule)
    expect(files.length).toBe(3)

    const types = files.map((f) => f.type)
    expect(types).toContain('model')
    expect(types).toContain('route')
  })

  it('should generate correct model content', () => {
    const files = generateCrud(testModule)
    const modelFile = files.find((f) => f.path.includes('models/'))
    expect(modelFile).toBeDefined()
    expect(modelFile!.content).toContain('interface')
    expect(modelFile!.content).toContain('name')
    expect(modelFile!.content).toContain('phone')
  })

  it('should generate correct route content', () => {
    const files = generateCrud(testModule)
    const routeFile = files.find((f) => f.path.includes('routes/'))
    expect(routeFile).toBeDefined()
    expect(routeFile!.content).toContain('app.get')
    expect(routeFile!.content).toContain('app.post')
    expect(routeFile!.content).toContain('app.patch')
    expect(routeFile!.content).toContain('app.delete')
  })

  it('should return empty array for module without fields', () => {
    const noFieldsModule: ModuleDefinition = {
      name: '展示模块',
      description: '展示模块',
      responsibilities: ['展示内容'],
    }
    const files = generateCrud(noFieldsModule)
    expect(files).toEqual([])
  })
})

describe('naming utilities', () => {
  it('toPascalCase', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld')
    expect(toPascalCase('线索存储')).toBe('线索存储')
  })

  it('toCamelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
  })

  it('toKebabCase', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
  })
})
