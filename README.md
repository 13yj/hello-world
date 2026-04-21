# Hello World - Leads Collection MVP

这是一个线索收集官网与后台管理 MVP 项目。

## 后端服务 (server/)

使用 Node.js + Fastify + TypeScript 搭建的后端 API 服务。

### 接口列表

- `POST /api/leads` - 创建线索（name、phone 必填）
- `GET /api/admin/leads` - 获取线索列表
- `PATCH /api/admin/leads/:id/status` - 更新线索状态（new/contacted/closed）

### 数据存储

使用本地 JSON 文件存储，数据文件位于 `server/data/leads.json`。

### 开发

```bash
cd server
npm install
npm run dev   # 启动开发服务器
npm test      # 运行测试
npm run build # 构建
```
