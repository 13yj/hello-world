/**
 * Core types for the code generation service
 */

/** Represents a module parsed from a technical document */
export interface ModuleDefinition {
  name: string
  description: string
  responsibilities: string[]
  fields?: FieldDefinition[]
  routes?: RouteDefinition[]
  components?: string[]
}

/** Represents a data field within a module */
export interface FieldDefinition {
  name: string
  type: string
  required: boolean
  description?: string
}

/** Represents an API route */
export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  requestBody?: FieldDefinition[]
  responseType?: string
}

/** Represents a generated code file */
export interface GeneratedFile {
  path: string
  content: string
  type: 'model' | 'route' | 'component' | 'test' | 'config'
}

/** Technical document structure after parsing */
export interface TechDocument {
  title: string
  modules: ModuleDefinition[]
  techStack: TechStackConfig
  routes: RouteDefinition[]
  constraints: string[]
}

/** Technology stack configuration */
export interface TechStackConfig {
  frontend: string
  backend: string
  storage: string
  styling: string
  testing: string
}

/** Code generation request */
export interface GenerationRequest {
  document: string
  outputDir?: string
  modules?: string[]
}

/** Code generation response */
export interface GenerationResponse {
  success: boolean
  files: GeneratedFile[]
  summary: string
  errors?: string[]
}
