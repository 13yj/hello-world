const form = document.getElementById('lead-form');
const messageEl = document.getElementById('form-message');
const submitButton = document.getElementById('submit-button');

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (!String(payload.name || '').trim()) {
    setMessage('请填写姓名', 'error');
    return;
  }

  if (!String(payload.phone || '').trim()) {
    setMessage('请填写手机号', 'error');
    return;
  }

  submitButton.disabled = true;
  setMessage('正在提交...', 'pending');

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '提交失败，请稍后重试');
    }

    form.reset();
    setMessage(result.message || '提交成功', 'success');
  } catch (error) {
    setMessage(error.message || '提交失败，请稍后重试', 'error');
  } finally {
    submitButton.disabled = false;
  }
});
