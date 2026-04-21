export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
}

export interface ModuleDefinition {
  name: string;
  entity: string;
  fields: FieldDefinition[];
  features?: string[];
}

export interface TechnicalSolution {
  projectName: string;
  outputDir?: string;
  modules: ModuleDefinition[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}
