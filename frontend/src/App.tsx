import LeadForm from './components/LeadForm'
import './App.css'

const features = [
  { title: '智能高效', desc: '基于 AI 驱动，让业务流程自动化，大幅提升工作效率。' },
  { title: '安全可靠', desc: '企业级数据安全保障，全链路加密，合规无忧。' },
  { title: '灵活定制', desc: '模块化架构设计，按需组合，快速适配各类业务场景。' },
]

export default function App() {
  return (
    <div className="app">
      {/* Hero */}
      <header className="hero">
        <h1 className="hero-title">让技术驱动增长</h1>
        <p className="hero-subtitle">
          一站式智能解决方案，助力企业数字化转型
        </p>
        <a href="#contact" className="hero-cta">立即咨询</a>
      </header>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">为什么选择我们</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Lead Form */}
      <section id="contact" className="contact">
        <LeadForm />
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} 版权所有</p>
      </footer>
    </div>
  )
}
