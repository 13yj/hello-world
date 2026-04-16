import type { ReactNode } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';

const highlights = [
  'AI 驱动的线索收集与跟进流程，适合快速上线演示。',
  '官网展示、咨询入口与留资区域在同一页面闭环呈现。',
  '后台管理路由已预留基础布局，便于后续接入线索列表与状态流转。',
];

const adminColumns = ['姓名', '手机号', '公司', '状态'];

function SiteHeader() {
  return (
    <nav className="site-nav" aria-label="主导航">
      <Link className="brand-mark" to="/">
        LeadFlow MVP
      </Link>
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
          end
        >
          官网首页
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
        >
          后台首页
        </NavLink>
      </div>
    </nav>
  );
}

function PageLayout({ children, pageClassName = '' }: { children: ReactNode; pageClassName?: string }) {
  return (
    <div className={`page-shell ${pageClassName}`.trim()}>
      <SiteHeader />
      {children}
    </div>
  );
}

function HomePage() {
  return (
    <PageLayout>
      <header className="hero-card">
        <span className="eyebrow">Lead Collection MVP</span>
        <h1>线索收集官网首页</h1>
        <p className="hero-copy">
          用统一的官网样式展示产品标题、核心卖点与咨询入口，支持用户直接跳转到留资区域，也可进入后台查看后续线索承载页面。
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#lead-form-container">
            立即咨询
          </a>
          <a className="secondary-button" href="#lead-form-container">
            滚动到留资区域
          </a>
          <Link className="secondary-button" to="/admin">
            查看后台页
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
          <p>用户可以从首页主按钮快速跳转到留资区域，也可以通过统一风格的咨询卡片了解产品对接方式。</p>
          <div className="contact-card">
            <span>售前咨询邮箱</span>
            <strong>contact@example.com</strong>
          </div>
          <div className="contact-card shared-style-card">
            <span>页面统一样式</span>
            <strong>首页与后台共用深色卡片、圆角按钮和表格容器样式，便于后续继续扩展。</strong>
          </div>
        </section>

        <section className="panel form-panel" id="lead-form-container">
          <h2>留资区域</h2>
          <p>当前子任务先完成可滚动定位的留资容器，后续可在此接入表单字段、校验与提交流程。</p>
          <div className="form-placeholder" aria-label="留资表单占位">
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
              提交入口占位
            </button>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

function AdminPage() {
  return (
    <PageLayout pageClassName="admin-shell">
      <section className="panel admin-panel">
        <span className="eyebrow">Admin Route</span>
        <h1>后台线索列表基础布局</h1>
        <p>当前页面提供线索列表承载区、表头和示例行，为后续接入查询数据与状态更新能力预留结构。</p>
        <div className="admin-placeholder" aria-label="线索列表占位表格">
          <div className="table-head">
            {adminColumns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          <div className="table-row muted-row">
            <span>示例线索</span>
            <span>138****0000</span>
            <span>Demo Company</span>
            <span>new</span>
          </div>
          <div className="table-row muted-row">
            <span>待接入真实数据</span>
            <span>--</span>
            <span>--</span>
            <span>pending</span>
          </div>
        </div>
        <div className="hero-actions">
          <Link className="secondary-button" to="/">
            返回首页
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}

function NotFoundPage() {
  return (
    <PageLayout>
      <section className="panel admin-panel">
        <span className="eyebrow">404</span>
        <h1>页面不存在</h1>
        <p>当前仅提供官网首页与 /admin 两个基础路由入口。</p>
        <Link className="primary-button" to="/">
          返回首页
        </Link>
      </section>
    </PageLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
