# hello-world

最小可运行的技术方案生成 API：

- `POST /api/tech-solutions` 接收产品需求并生成结构化技术方案
- 优先调用外部 AI 模型；未配置 `AI_TOKEN` 时自动回退到本地模板生成
- `GET /health` 健康检查

## 启动

```bash
npm start
```

默认访问：`http://localhost:3000`

## 接口示例

```bash
curl --request POST \
  --url http://localhost:3000/api/tech-solutions \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "实现技术方案生成 API",
    "productRequirement": "创建技术方案生成接口，接收产品需求输入，调用 AI 模型生成结构化技术方案文档，包含架构设计、技术栈选择和模块划分。"
  }'
```

可选环境变量：

- `AI_TOKEN`：外部 AI 网关 Bearer Token
- `AI_BASE_URL`：AI 网关地址，默认 `http://api-ai-lcc.newchinalife.com`
- `AI_MODEL`：模型名，默认 `Aliyun/GLM-4.7`
