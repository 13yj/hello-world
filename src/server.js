const http = require('http');
const { readLeads, createLead, updateLeadStatus } = require('./storage');

const VALID_STATUSES = new Set(['new', 'contacted', 'closed']);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function renderHomePage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>线索收集 MVP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 48px 20px; }
    .hero, .card { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); padding: 24px; margin-bottom: 20px; }
    h1, h2 { margin-top: 0; }
    .bullets { display: grid; gap: 10px; padding-left: 18px; }
    form { display: grid; gap: 12px; }
    input, textarea, select, button { font: inherit; padding: 12px; border-radius: 10px; border: 1px solid #d1d5db; }
    button { background: #2563eb; color: white; border: none; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    .row { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .hint { color: #6b7280; font-size: 14px; }
    .status { min-height: 24px; font-size: 14px; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>线索官网与后台一体化 MVP</h1>
      <p>同一个本地服务同时提供官网首页、线索提交接口和后台管理页，方便直接演示完整链路。</p>
      <ul class="bullets">
        <li>首页打开即可提交咨询线索</li>
        <li>线索使用本地 JSON 文件持久化</li>
        <li><a href="/admin">进入后台</a> 查看线索并更新状态</li>
      </ul>
    </section>
    <section class="card">
      <h2>提交咨询线索</h2>
      <p class="hint">姓名和手机号为必填项。提交成功后，可立即在后台页查看。</p>
      <form id="lead-form">
        <div class="row">
          <input name="name" placeholder="姓名 *" required />
          <input name="phone" placeholder="手机号 *" required />
        </div>
        <input name="company" placeholder="公司" />
        <textarea name="message" placeholder="补充需求" rows="4"></textarea>
        <button type="submit">提交线索</button>
        <div id="status" class="status"></div>
      </form>
    </section>
  </div>
  <script>
    const form = document.getElementById('lead-form');
    const status = document.getElementById('status');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.phone) {
        status.textContent = '请先填写姓名和手机号';
        status.style.color = '#dc2626';
        return;
      }
      status.textContent = '提交中...';
      status.style.color = '#6b7280';
      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || '提交失败');
        form.reset();
        status.textContent = '提交成功，已保存线索';
        status.style.color = '#16a34a';
      } catch (error) {
        status.textContent = error.message || '提交失败，请稍后再试';
        status.style.color = '#dc2626';
      }
    });
  </script>
</body>
</html>`;
}

function renderAdminPage(leads) {
  const rows = leads.map((lead) => `
    <tr>
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.phone)}</td>
      <td>${escapeHtml(lead.company || '-')}</td>
      <td>${escapeHtml(lead.message || '-')}</td>
      <td>
        <select data-id="${lead.id}">
          ${['new', 'contacted', 'closed'].map((status) => `<option value="${status}" ${lead.status === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </td>
      <td>${escapeHtml(new Date(lead.createdAt).toLocaleString('zh-CN'))}</td>
    </tr>
  `).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>后台线索管理</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; background: #f5f7fb; color: #1f2937; }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); padding: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    select { padding: 8px; border-radius: 8px; }
    .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .hint { color: #6b7280; font-size: 14px; }
    a { color: #2563eb; text-decoration: none; }
    #status { min-height: 24px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div>
        <h1>后台线索管理</h1>
        <div class="hint">当前共 ${leads.length} 条线索，本地刷新后会从 JSON 存储中重新读取。</div>
      </div>
      <a href="/">返回首页</a>
    </div>
    <div class="card">
      <div id="status"></div>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>手机号</th>
            <th>公司</th>
            <th>需求</th>
            <th>状态</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6">暂无线索，可先去首页提交一条。</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  <script>
    const status = document.getElementById('status');
    document.querySelectorAll('select[data-id]').forEach((select) => {
      select.addEventListener('change', async () => {
        const id = select.getAttribute('data-id');
        const nextStatus = select.value;
        status.textContent = '保存中...';
        status.style.color = '#6b7280';
        try {
          const response = await fetch('/api/admin/leads/' + id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || '保存失败');
          status.textContent = '状态已更新为 ' + payload.lead.status;
          status.style.color = '#16a34a';
        } catch (error) {
          status.textContent = error.message || '保存失败';
          status.style.color = '#dc2626';
        }
      });
    });
  </script>
</body>
</html>`;
}

function buildServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        sendHtml(res, renderHomePage());
        return;
      }
      if (req.method === 'GET' && url.pathname === '/admin') {
        sendHtml(res, renderAdminPage(readLeads()));
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/admin/leads') {
        sendJson(res, 200, { leads: readLeads() });
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/leads') {
        const body = await readBody(req);
        if (!body.name || !String(body.name).trim() || !body.phone || !String(body.phone).trim()) {
          sendJson(res, 400, { error: 'name and phone are required' });
          return;
        }
        const lead = createLead(body);
        sendJson(res, 201, { lead });
        return;
      }
      const statusMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
      if (req.method === 'PATCH' && statusMatch) {
        const body = await readBody(req);
        if (!VALID_STATUSES.has(body.status)) {
          sendJson(res, 400, { error: 'invalid status' });
          return;
        }
        const lead = updateLeadStatus(statusMatch[1], body.status);
        if (!lead) {
          sendJson(res, 404, { error: 'lead not found' });
          return;
        }
        sendJson(res, 200, { lead });
        return;
      }
      sendJson(res, 404, { error: 'not found' });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'internal error' });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  buildServer().listen(port, () => {
    console.log(`Leads MVP server listening on http://127.0.0.1:${port}`);
  });
}

module.exports = { buildServer };
