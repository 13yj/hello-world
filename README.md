# Tech Solution Generation API

接收产品需求输入，调用 AI 模型生成结构化技术方案文档，包含架构设计、技术栈选择和模块划分。

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Testing**: Vitest

## API Endpoints

### POST /api/tech-solution/generate

Generate a structured tech solution from product requirements.

**Request Body:**
```json
{
  "requirement": {
    "title": "Project Title",
    "description": "Detailed description of the product requirements",
    "features": ["Feature 1", "Feature 2"],
    "constraints": ["Constraint 1"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sol_...",
    "title": "Technical Solution: ...",
    "architecture": { ... },
    "techStack": [ ... ],
    "modules": [ ... ],
    "implementationPlan": [ ... ],
    "risks": [ ... ]
  }
}
```

### GET /api/tech-solution/:id
Retrieve a previously generated solution by ID.

### GET /api/tech-solution
List all generated solutions.

### GET /health
Health check endpoint.

## Development

```bash
npm install
npm run dev     # Start dev server
npm test        # Run tests
npm run build   # Build for production
npm start       # Start production server
```
