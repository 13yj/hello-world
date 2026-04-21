import type { ProductRequirement, TechSolution } from './types.js'

/**
 * Tech solution generator - accepts product requirements and
 * generates structured technical solution documents.
 */
export class TechSolutionGenerator {
  async generate(requirement: ProductRequirement): Promise<TechSolution> {
    const id = `sol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const createdAt = new Date().toISOString()

    return {
      id,
      title: `Technical Solution: ${requirement.title}`,
      createdAt,
      requirement,
      architecture: this.generateArchitecture(requirement),
      techStack: this.selectTechStack(requirement),
      modules: this.divideModules(requirement),
      implementationPlan: this.createPlan(requirement),
      risks: this.identifyRisks(requirement)
    }
  }

  private generateArchitecture(req: ProductRequirement): TechSolution['architecture'] {
    const desc = req.description.toLowerCase()
    const hasBackend = desc.includes('api') || desc.includes('backend') || desc.includes('server')
    const hasFrontend = desc.includes('ui') || desc.includes('frontend') || desc.includes('web')

    const components: TechSolution['architecture']['components'] = []

    if (hasFrontend) {
      components.push({ name: 'Frontend Application', responsibility: 'User interface and interaction layer', dependencies: hasBackend ? ['Backend API'] : [] })
    }
    if (hasBackend || !hasFrontend) {
      components.push({ name: 'Backend API', responsibility: 'Business logic and data processing', dependencies: ['Data Storage'] })
      components.push({ name: 'Data Storage', responsibility: 'Persistent data management', dependencies: [] })
    }

    return {
      overview: `${req.title} uses a ${components.length > 2 ? 'multi-tier' : 'simple'} architecture.`,
      components,
      dataFlow: hasFrontend && hasBackend
        ? 'User → Frontend → API → Storage → API → Frontend → User'
        : 'Client → API → Storage → API → Client'
    }
  }

  private selectTechStack(req: ProductRequirement): TechSolution['techStack'] {
    const stack: TechSolution['techStack'] = []
    const desc = req.description.toLowerCase()

    if (desc.includes('frontend') || desc.includes('ui') || desc.includes('web')) {
      stack.push({ category: 'Frontend', choice: 'React + TypeScript + Vite', reason: 'Modern, type-safe, fast development experience' })
    }
    if (desc.includes('backend') || desc.includes('api') || desc.includes('server') || stack.length === 0) {
      stack.push({ category: 'Backend', choice: 'Node.js + Fastify + TypeScript', reason: 'High performance, type safety, excellent DX' })
    }
    stack.push({ category: 'Data Storage', choice: 'JSON file / In-memory (MVP)', reason: 'Simple, no infrastructure overhead for MVP' })
    stack.push({ category: 'Testing', choice: 'Vitest', reason: 'Fast, modern testing with great TypeScript support' })
    return stack
  }

  private divideModules(req: ProductRequirement): TechSolution['modules'] {
    const modules: TechSolution['modules'] = []
    const features = req.features || []

    modules.push({
      name: 'Core API',
      description: 'Main API endpoints and request handling',
      interfaces: ['POST /api/generate', 'GET /api/solutions/:id'],
      dependencies: [],
      priority: 'high'
    })

    features.forEach((feature, idx) => {
      modules.push({
        name: feature,
        description: `Implements ${feature} functionality`,
        interfaces: [`I${feature.replace(/\s+/g, '')}`],
        dependencies: ['Core API'],
        priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low'
      })
    })

    return modules
  }

  private createPlan(req: ProductRequirement): string[] {
    return [
      'Set up project structure and dependencies',
      'Define data models and types',
      'Implement core business logic',
      'Build API endpoints',
      'Add input validation',
      'Write unit and integration tests',
      'Perform integration testing'
    ]
  }

  private identifyRisks(req: ProductRequirement): string[] {
    const risks = ['Technology stack learning curve', 'Requirements may evolve during development']
    if (req.constraints && req.constraints.length > 0) {
      risks.push('Constraints may limit implementation options')
    }
    return risks
  }
}
