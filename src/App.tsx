import { FormEvent, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

type LeadStatus = 'new' | 'contacted' | 'closed';

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  company: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
}

interface LeadFormState {
  name: string;
  phone: string;
  company: string;
  message: string;
}

const highlights = [
  {
    title: '官网咨询入口一屏承接',
    description: '首屏直接说明产品价值，并通过按钮快速跳转到留资表单，减少演示路径跳转成本。',
  },
  {
    title: '线索收集信息最小可用',
    description: '仅保留姓名、手机号、公司与需求说明四个字段，满足当前 MVP 留资采集需求。',
  },
  {
    title: '首页到后台路由闭环',
    description: '提交后的线索会立即出现在后台演示列表中，方便验证前台到后台的最小链路。',
  },
];

const initialFormState: LeadFormState = {
  name: '',
  phone: '',
  company: '',
  message: '',
};

const initialLead: LeadItem = {
  id: 'demo-lead-1',
  name: '王小明',
  phone: '13800000000',
  company: '星河科技',
  message: '希望了解官网获客和线索管理的一体化演示方案。',
  status: 'new',
  createdAt: '2026-04-16 13:30',
};

function HomePage({ leads, onSubmitLead }: { leads: LeadItem[]; onSubmitLead: (payload: LeadFormState) => void }) {
  const [formState, setFormState] = useState<LeadFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const latestLead = useMemo(() => leads[0], [leads]);

  function updateField(field: keyof LeadFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.name.trim() || !formState.phone.trim()) {
      setSuccessMessage('');
      setErrorMessage('请先填写姓名和手机号。');
      return;
    }

    onSubmitLead({
      name: formState.name.trim(),
      phone: formState.phone.trim(),
      company: formState.company.trim(),
      message: formState.message.trim(),
    });

    setErrorMessage('');
    setSuccessMessage('提交成功，线索已进入后台列表。');
    setFormState(initialFormState);
  }

  return (
    <div className="page-shell">
      <header className="hero-card hero-layout">
        <div>
          <span className="eyebrow">Lead Collection MVP</span>
          <h1>用 AI 官网演示页高效承接咨询与线索</h1>
          <p className="hero-copy">
            面向销售和运营团队的轻量 MVP 首页：清晰展示产品卖点，支持用户快速留资，并保留一键进入后台查看线索的最小可达路径。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#lead-form-container">
              立即咨询
            </a>
            <Link className="secondary-button" to="/admin">
              查看后台线索
            </Link>
          </div>
        </div>

        <aside className="hero-summary-card">
          <span className="summary-label">最新留资演示</span>
          <strong>{latestLead.name}</strong>
          <p>{latestLead.company || '未填写公司'} · {latestLead.phone}</p>
          <span className="status-chip">{latestLead.status}</span>
        </aside>
      </header>

      <main className="content-stack">
        <section className="panel">
          <h2>产品卖点</h2>
          <div className="selling-grid">
            {highlights.map((item) => (
              <article className="selling-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-grid two-column-grid">
          <section className="panel contact-panel">
            <h2>咨询入口</h2>
            <p>可以点击首屏按钮直达表单区域，也可以通过售前联系方式快速发起沟通。</p>
            <div className="contact-card">
              <span>售前咨询邮箱</span>
              <strong>contact@example.com</strong>
            </div>
            <div className="contact-card quick-entry-card">
              <span>演示路径</span>
              <strong>首页留资 → 后台查看 → 状态跟进</strong>
              <Link className="inline-link" to="/admin">
                直接打开后台列表
              </Link>
            </div>
          </section>

          <section className="panel form-panel" id="lead-form-container">
            <h2>留资表单</h2>
            <p>填写基础信息后即可完成演示提交，后台页面会同步展示最新线索。</p>
            <form className="lead-form" onSubmit={handleSubmit}>
              <label>
                <span>姓名 *</span>
                <input
                  value={formState.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="请输入姓名"
                />
              </label>
              <label>
                <span>手机号 *</span>
                <input
                  value={formState.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="请输入手机号"
                />
              </label>
              <label>
                <span>公司</span>
                <input
                  value={formState.company}
                  onChange={(event) => updateField('company', event.target.value)}
                  placeholder="请输入公司名称"
                />
              </label>
              <label>
                <span>需求说明</span>
                <textarea
                  value={formState.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="请简要描述您的业务场景"
                  rows={4}
                />
              </label>
              {errorMessage ? <p className="feedback-text error-text">{errorMessage}</p> : null}
              {successMessage ? <p className="feedback-text success-text">{successMessage}</p> : null}
              <button className="primary-button submit-button" type="submit">
                提交咨询
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}

function AdminPage({ leads }: { leads: LeadItem[] }) {
  return (
    <div className="page-shell admin-shell">
      <section className="panel admin-panel">
        <div className="admin-header">
          <div>
            <span className="eyebrow">Admin Route</span>
            <h1>后台线索列表</h1>
            <p>用于演示官网首页到后台页面的最小闭环，展示当前已提交的线索信息。</p>
          </div>
          <Link className="secondary-button" to="/">
            返回首页
          </Link>
        </div>

        <div className="admin-placeholder">
          <div className="table-head">
            <span>姓名</span>
            <span>手机号</span>
            <span>公司</span>
            <span>状态</span>
          </div>
          {leads.map((lead) => (
            <div className="table-row" key={lead.id}>
              <span>{lead.name}</span>
              <span>{lead.phone}</span>
              <span>{lead.company || '未填写'}</span>
              <span>{lead.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [leads, setLeads] = useState<LeadItem[]>([initialLead]);

  function handleSubmitLead(payload: LeadFormState) {
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const nextLead: LeadItem = {
      id: `${Date.now()}`,
      ...payload,
      status: 'new',
      createdAt,
    };

    setLeads((current) => [nextLead, ...current]);
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage leads={leads} onSubmitLead={handleSubmitLead} />} />
      <Route path="/admin" element={<AdminPage leads={leads} />} />
    </Routes>
  );
}
