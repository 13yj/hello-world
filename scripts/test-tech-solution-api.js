import { spawn } from 'node:child_process';

const port = 3210;
const server = spawn(process.execPath, ['server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server start timeout')), 5000);
    server.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      if (text.includes(`http://localhost:${port}`)) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      if (text.trim()) {
        clearTimeout(timer);
        reject(new Error(text));
      }
    });
    server.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited early: ${code}`));
    });
  });
}

async function run() {
  try {
    await waitForServer();

    const response = await fetch(`http://localhost:${port}/api/tech-solutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '智能开发：实现技术方案生成 API',
        productRequirement: '创建技术方案生成接口，接收产品需求输入，调用 AI 模型生成结构化技术方案文档，包含架构设计、技术栈选择和模块划分。'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`unexpected status ${response.status}: ${JSON.stringify(result)}`);
    }

    const data = result?.data;
    if (!data?.overview || !data?.architecture || !Array.isArray(data?.techStack) || !Array.isArray(data?.modules)) {
      throw new Error(`invalid response: ${JSON.stringify(result)}`);
    }

    console.log('tech solution api test passed');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
