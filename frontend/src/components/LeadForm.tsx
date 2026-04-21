import { useState, type FormEvent } from 'react'
import styles from './LeadForm.module.css'

interface FormData {
  name: string
  phone: string
  company: string
  message: string
}

interface FormErrors {
  name?: string
  phone?: string
}

export default function LeadForm() {
  const [form, setForm] = useState<FormData>({ name: '', phone: '', company: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = '姓名为必填项'
    if (!form.phone.trim()) {
      errs.phone = '手机号为必填项'
    } else if (!/^1\d{10}$/.test(form.phone.trim())) {
      errs.phone = '请输入有效的手机号'
    }
    return errs
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setResult(null)
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`提交失败 (${res.status})`)
      setResult({ type: 'success', text: '提交成功！我们会尽快与您联系。' })
      setForm({ name: '', phone: '', company: '', message: '' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '提交失败，请稍后重试'
      setResult({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>立即咨询</h2>

      <label className={styles.label}>
        姓名 <span className={styles.required}>*</span>
        <input
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="请输入您的姓名"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </label>

      <label className={styles.label}>
        手机号 <span className={styles.required}>*</span>
        <input
          className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="请输入您的手机号"
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
      </label>

      <label className={styles.label}>
        公司
        <input
          className={styles.input}
          type="text"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="请输入公司名称"
        />
      </label>

      <label className={styles.label}>
        留言
        <textarea
          className={styles.textarea}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="请输入您的需求"
          rows={4}
        />
      </label>

      <button className={styles.button} type="submit" disabled={submitting}>
        {submitting ? '提交中...' : '提交'}
      </button>

      {result && (
        <p className={result.type === 'success' ? styles.success : styles.errorMsg}>
          {result.text}
        </p>
      )}
    </form>
  )
}
