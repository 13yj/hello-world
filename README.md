# Code Generation Service

一个最小可用的 TypeScript 代码生成服务：读取技术方案 JSON，按模块生成后端 CRUD 模板和简单 React 页面模板。

## 能力
- 解析模块、实体、字段定义
- 为每个模块生成 model/store/routes
- 生成简单表单页面模板
- 提供 CLI 批量生成文件

## 使用
```bash
npm install
npm run build
npm run generate -- examples/lead-mvp.solution.json
```

生成结果默认输出到当前目录下的 `generated/`。

## 技术方案输入格式
```json
{
  "projectName": "Lead Collection MVP",
  "modules": [
    {
      "name": "Lead Form",
      "entity": "lead",
      "fields": [
        { "name": "name", "type": "string", "required": true }
      ]
    }
  ]
}
```

## 验证
```bash
npm test
```
