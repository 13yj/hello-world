import { FormEvent, useMemo, useState } from 'react'

type FormState = {
  name: string
  phone: string
  company: string
  message: string
}

const initialForm: FormState = {
  name: '',
  phone: '',
  company: '',
  message: '',
}

const highlights = [
  '7x24 小时智能接待，快速响应客户咨询',
  '标准化收集线索信息，降低人工记录成本',
  '支持从官网展示直达留资表单，适合稳定演示',
]

export default function App() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = useMemo(() => {
    return form.name.trim() !== '' && form.phone.trim() !== ''
  }, [form])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
  }

  const jumpToConsult = () => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">InfFlow AI · 官网首页</span>
          <h1>让官网咨询入口更清晰，让线索收集更高效</h1>
          <p className="hero-description">
            面向企业官网场景，集中展示产品价值、核心卖点与明确行动入口，帮助访客快速了解方案并进入咨询流程。
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={jumpToConsult}>
              立即咨询
            </button>
            <a className="secondary-link" href="#consult-form">
              查看留资表单
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h2>核心卖点</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="consult-section" id="consult-form">
        <div className="section-heading">
          <span className="eyebrow">咨询入口</span>
          <h2>提交需求，我们会尽快与您联系</h2>
          <p>表单保留最小必要字段，便于演示从官网首页进入咨询流程的完整路径。</p>
        </div>

        <form className="consult-form" onSubmit={handleSubmit}>
          <label>
            联系人姓名
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="请输入姓名"
            />
          </label>
          <label>
            联系电话
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="请输入电话"
            />
          </label>
          <label>
            公司名称
            <input
              value={form.company}
              onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
              placeholder="请输入公司名称"
            />
          </label>
          <label>
            咨询需求
            <textarea
              rows={4}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="请简单描述您的业务场景"
            />
          </label>
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            提交咨询
          </button>
          <p className="form-hint">联系人姓名和联系电话为必填项。</p>
          {submitted ? <p className="success-message">咨询信息已提交，演示页面已完成首页到留资入口闭环。</p> : null}
        </form>
      </section>
    </main>
  )
}
