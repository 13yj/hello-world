# Code Generation Service

A service that parses technical documents and automatically generates code files based on module definitions.

## Features

- **Document Parsing**: Parses markdown-formatted technical documents to extract module definitions, tech stack, and constraints
- **CRUD Generation**: Automatically generates TypeScript models, stores, and Fastify route handlers for data modules
- **Page Templates**: Generates React page components (forms, lists, basic pages) based on module responsibilities
- **REST API**: Exposes code generation capabilities via HTTP endpoints

## Architecture

```
src/
├── types.ts                    # Core type definitions
├── service.ts                  # Main service orchestrator
├── server.ts                   # Fastify HTTP server
├── parsers/
│   └── document-parser.ts      # Technical document parser
├── generators/
│   ├── crud-generator.ts       # CRUD code generator
│   └── page-generator.ts       # React page template generator
└── __tests__/                  # Test suite
```

## Installation

```bash
npm install
```

## Usage

### As a Service

Start the HTTP server:

```bash
npm run dev
```

The service will be available at `http://localhost:3100`

### API Endpoints

#### POST /api/generate

Generate code from a technical document.

**Request:**
```json
{
  "document": "# Technical Document\n...",
  "outputDir": "./output",
  "modules": ["模块1", "模块2"]
}
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "path": "src/models/lead.ts",
      "content": "...",
      "type": "model"
    }
  ],
  "summary": "Generated 12 files from 4 modules"
}
```

#### POST /api/parse

Parse a technical document without generating code.

**Request:**
```json
{
  "document": "# Technical Document\n..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Technical Document",
    "modules": [...],
    "techStack": {...},
    "routes": [...],
    "constraints": [...]
  }
}
```

#### GET /api/templates

List available code templates.

#### GET /health

Health check endpoint.

### As a Library

```typescript
import { generateCode, parseDocument } from './service.js'

const result = generateCode({
  document: technicalDocMarkdown,
  outputDir: './generated',
  modules: ['留资表单模块']
})

console.log(result.summary)
console.log(`Generated ${result.files.length} files`)
```

## Generated Code

The service generates the following types of files:

### CRUD Files (for modules with data fields)

- **Model**: TypeScript interfaces for data types
- **Store**: In-memory + JSON file storage with CRUD operations
- **Routes**: Fastify route handlers for REST API

### Page Templates (based on module responsibilities)

- **Form Pages**: React form components with validation and submission
- **List Pages**: React list/table components with data fetching
- **Basic Pages**: Simple content pages

## Testing

```bash
npm test
```

## Build

```bash
npm run build
```

## Example

Given a technical document describing a leads collection system, the service will generate:

- `src/models/lead.ts` - Lead data model
- `src/stores/lead-store.ts` - Lead storage with CRUD operations
- `src/routes/lead-routes.ts` - REST API routes
- `src/pages/lead-form.tsx` - Lead submission form
- `src/pages/lead-list.tsx` - Lead management list
- CSS files for styling

## Configuration

Set the server port via environment variable:

```bash
PORT=3100 npm run dev
```

## License

MIT
