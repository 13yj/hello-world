import http from 'node:http';

const port = Number(process.env.PORT || 3000);
const aiBaseUrl = process.env.AI_BASE_URL || 'http://api-ai-lcc.newchinalife.com';
const aiModel = process.env.AI_MODEL || 'Aliyun/GLM-4.7';
const aiToken = process.env.AI_TOKEN || '';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function normalizeText(value) {
  return String(value || '').trim();
}

function validateRequest(payload) {
  const productRequirement = normalizeText(payload?.productRequirement || payload?.requirement || payload?.prd);
  const title = normalizeText(payload?.title) || '未命名需求';
  const context = normalizeText(payload?.context);

  if (!productRequirement) {
    return { ok: false, error: 'productRequirement 为必填项' };
  }

  return {
    ok: true,
    data: { title, context, productRequirement }
  };
}

function buildFallbackPlan(input) {
  const techStack = [
    {
      name: 'Node.js',
      reason: '使用简单、适合快速搭建 API 服务，并可直接复用原生 http 能力完成 MVP。'
    },
    {
      name: '原生 Fetch API',
      reason: '便于对接外部 AI 模型服务，无需增加额外依赖。'
    },
    {
      name: 'JSON',
      reason: '结构化输出技术方案文档，便于前端展示和后续自动化处理。'
    }
  ];

  const modules = [
    {
      name: '需求解析模块',
      responsibility: '清洗并校验产品需求输入，提取标题、背景和核心目标。'
    },
    {
      name: '方案生成模块',
      responsibility: '调用 AI 模型或降级模板生成结构化技术方案。'
    },
    {
      name: '结果编排模块',
      responsibility: '统一输出架构设计、技术栈选择和模块划分等结构化字段。'
    }
  ];

  return {
    title: input.title,
    overview: `围绕“${input.title}”构建一个技术方案生成 API，接收产品需求文本，产出可直接用于评审的结构化技术方案文档。`,
    architecture: {
      pattern: '单体 API 服务',
      components: [
        'HTTP 接口层：接收产品需求并返回结构化方案',
        'AI 调用层：封装模型提示词与结果解析',
        '回退生成层：在外部模型不可用时提供稳定的模板化输出'
      ],
      flow: [
        '客户端提交产品需求',
        '服务端校验并组装提示词',
        '优先调用 AI 模型生成方案',
        '解析结果并返回结构化 JSON'
      ]
    },
    techStack,
    modules,
    risks: [
      'AI 输出可能存在字段缺失，需要增加兜底解析。',
      '外部模型网络不可用时需要回退方案，保证接口稳定返回。'
    ],
    inputSummary: input.productRequirement,
    generatedBy: 'fallback-template'
  };
}

function buildPrompt(input) {
  return [
    '你是一名资深技术负责人，请根据产品需求生成结构化技术方案。',
    '输出必须是 JSON 对象，不要输出 markdown，不要输出额外解释。',
    'JSON 顶层字段必须包含：title, overview, architecture, techStack, modules, risks。',
    '其中 architecture 必须包含 pattern, components, flow；techStack 为数组；modules 为数组。',
    `需求标题：${input.title}`,
    input.context ? `补充上下文：${input.context}` : '',
    `产品需求：${input.productRequirement}`
  ].filter(Boolean).join('\n');
}

async function generateWithAi(input) {
  if (!aiToken) {
    return buildFallbackPlan(input);
  }

  const response = await fetch(`${aiBaseUrl.replace(/\/$/, '')}/ai/llm/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      model: aiModel,
      stream: false,
      temperature: 0.1,
      chat_template_kwargs: { thinking: false },
      messages: [
        {
          role: 'user',
          content: buildPrompt(input)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI service returned empty content');
  }

  const parsed = JSON.parse(content);
  return {
    ...parsed,
    generatedBy: 'ai-model'
  };
}

async function handleGenerateTechSolution(req, res) {
  try {
    const payload = await parseBody(req);
    const validation = validateRequest(payload);
    if (!validation.ok) {
      return sendJson(res, 400, { message: validation.error });
    }

    let solution;
    try {
      solution = await generateWithAi(validation.data);
    } catch (error) {
      solution = buildFallbackPlan(validation.data);
      solution.fallbackReason = error instanceof Error ? error.message : 'unknown error';
    }

    return sendJson(res, 200, {
      message: '技术方案生成成功',
      data: solution
    });
  } catch (error) {
    return sendJson(res, 500, {
      message: '技术方案生成失败',
      error: error instanceof Error ? error.message : 'unknown error'
    });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/tech-solutions') {
    return handleGenerateTechSolution(req, res);
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { message: 'Not Found' });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
