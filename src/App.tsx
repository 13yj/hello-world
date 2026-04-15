import { Link, Route, Routes } from 'react-router-dom';

const highlights = [
  'AI 驱动的线索收集与跟进流程，适合快速上线演示。',
  '官网展示、咨询入口与留资表单容器一页串联。',
  '后台管理路由预留完成，便于后续接入线索列表与状态流转。',
];

function HomePage() {
  return (
    <div className="page-shell">
      <header className="hero-card">
        <span className="eyebrow">Lead Collection MVP</span>
        <h1>线索收集官网演示站</h1>
        <p className="hero-copy">
          面向销售与运营团队的轻量级官网骨架，帮助快速展示产品价值、承接咨询线索，并为后续后台管理功能预留扩展空间。
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#lead-form-container">
            立即咨询
          </a>
          <Link className="secondary-button" to="/admin">
            查看后台骨架
          </Link>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel">
          <h2>核心卖点</h2>
          <ul className="highlight-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="panel contact-panel">
          <h2>咨询入口</h2>
          <p>
            可以通过页面按钮跳转至留资区域，也可直接联系售前顾问进行需求沟通。
          </p>
          <div className="contact-card">
            <span>售前咨询邮箱</span>
            <strong>contact@example.com</strong>
          </div>
        </section>

        <section className="panel form-panel" id="lead-form-container">
          <h2>留资表单容器</h2>
          <p>当前子任务先提供页面容器骨架，后续可在此接入字段、校验与提交流程。</p>
          <div className="form-placeholder">
            <div className="placeholder-row">
              <span>姓名 *</span>
              <div />
            </div>
            <div className="placeholder-row">
              <span>手机号 *</span>
              <div />
            </div>
            <div className="placeholder-row">
              <span>公司</span>
              <div />
            </div>
            <div className="placeholder-row textarea-row">
              <span>需求说明</span>
              <div />
            </div>
            <button className="primary-button" type="button">
              提交按钮占位
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="page-shell admin-shell">
      <section className="panel admin-panel">
        <span className="eyebrow">Admin Route</span>
        <h1>后台页面骨架</h1>
        <p>
          当前页面用于承接后续线索列表、状态切换与管理能力。本次仅完成演示所需的路由与布局骨架。
        </p>
        <div className="admin-placeholder">
          <div className="table-head">
            <span>姓名</span>
            <span>手机号</span>
            <span>公司</span>
            <span>状态</span>
          </div>
          <div className="table-row muted-row">
            <span>待接入数据</span>
            <span>--</span>
            <span>--</span>
            <span>new</span>
          </div>
        </div>
        <Link className="secondary-button" to="/">
          返回首页
        </Link>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
