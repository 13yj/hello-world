import { describe, it, expect } from 'vitest'
import { generateTechSolution } from './generator.js'

describe('Tech Solution Generator', () => {
  it('should generate a complete tech solution', () => {
    const requirement = {
      title: '线索收集官网',
      description: '实现一个简单的线索收集系统',
      features: ['官网展示', '留资表单', '后台管理'],
      constraints: ['MVP阶段', '不需要数据库']
    }

    const solution = generateTechSolution(requirement)

    expect(solution.id).toBeDefined()
    expect(solution.title).toContain('线索收集官网')
    expect(solution.architecture.components.length).toBeGreaterThan(0)
    expect(solution.techStack.length).toBeGreaterThan(0)
    expect(solution.modules.length).toBe(3)
    expect(solution.implementationPlan.length).toBeGreaterThan(0)
    expect(solution.risks.length).toBeGreaterThan(0)
  })

  it('should handle minimal requirements', () => {
    const requirement = {
      title: '测试项目',
      description: '简单测试'
    }

    const solution = generateTechSolution(requirement)

    expect(solution.id).toBeDefined()
    expect(solution.title).toBe('技术方案：测试项目')
    expect(solution.modules.length).toBe(0)
  })
})
