import type { TechSolution } from './types.js'

/**
 * In-memory storage for generated solutions
 * For MVP - can be replaced with persistent storage later
 */
export class SolutionStore {
  private solutions = new Map<string, TechSolution>()

  save(solution: TechSolution): void {
    this.solutions.set(solution.id, solution)
  }

  get(id: string): TechSolution | undefined {
    return this.solutions.get(id)
  }

  list(): TechSolution[] {
    return Array.from(this.solutions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}
