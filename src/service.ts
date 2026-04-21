/**
 * Code Generation Service
 * Main service module that orchestrates document parsing and code generation
 */

import { parseDocument } from './parsers/document-parser.js'
import { generateCrud } from './generators/crud-generator.js'
import { generatePageTemplate } from './generators/page-generator.js'
import type { GeneratedFile, GenerationRequest, GenerationResponse } from './types.js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * Main code generation function
 * Parses a technical document and generates code files for all modules
 */
export function generateCode(request: GenerationRequest): GenerationResponse {
  const files: GeneratedFile[] = []
  const errors: string[] = []

  try {
    // Parse the technical document
    const doc = parseDocument(request.document)

    // Filter modules if specific ones are requested
    const targetModules = request.modules
      ? doc.modules.filter((m) =>
          request.modules!.some((name) =>
            m.name.toLowerCase().includes(name.toLowerCase())
          )
        )
      : doc.modules

    if (targetModules.length === 0 && doc.modules.length === 0) {
      errors.push('No modules found in the document')
    }

    // Generate code for each module
    for (const module of targetModules) {
      try {
        // Generate CRUD code if module has data fields
        const crudFiles = generateCrud(module)
        files.push(...crudFiles)

        // Generate page templates
        const pageFiles = generatePageTemplate(module)
        files.push(...pageFiles)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Failed to generate code for module "${module.name}": ${msg}`)
      }
    }

    // Write files to disk if output directory is specified
    if (request.outputDir && files.length > 0) {
      for (const file of files) {
        const fullPath = join(request.outputDir, file.path)
        mkdirSync(dirname(fullPath), { recursive: true })
        writeFileSync(fullPath, file.content, 'utf-8')
      }
    }

    return {
      success: errors.length === 0 || files.length > 0,
      files,
      summary: `Generated ${files.length} files from ${targetModules.length} modules`,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      files: [],
      summary: `Code generation failed: ${msg}`,
      errors: [msg],
    }
  }
}

export { parseDocument } from './parsers/document-parser.js'
export { generateCrud } from './generators/crud-generator.js'
export { generatePageTemplate } from './generators/page-generator.js'
export type * from './types.js'
