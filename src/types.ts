/** Types for tech solution generation API */

export interface ProductRequirement {
  title: string
  description: string
  features?: string[]
  constraints?: string[]
}

export interface ArchitectureDesign {
  overview: string
  components: Array<{
    name: string
    responsibility: string
    dependencies: string[]
  }>
  dataFlow: string
}

export interface TechStackChoice {
  category: string
  choice: string
  reason: string
}

export interface ModuleDivision {
  name: string
  description: string
  interfaces: string[]
  dependencies: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface TechSolution {
  id: string
  title: string
  createdAt: string
  requirement: ProductRequirement
  architecture: ArchitectureDesign
  techStack: TechStackChoice[]
  modules: ModuleDivision[]
  implementationPlan: string[]
  risks: string[]
}

export interface GenerateSolutionRequest {
  requirement: ProductRequirement
}

export interface GenerateSolutionResponse {
  success: boolean
  data?: TechSolution
  error?: string
}
