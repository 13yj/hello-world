import { useState } from 'react';

const initialState = {
  name: '',
  phone: '',
  company: '',
  message: '',
  status: ''
};

export const LeadFormPage = () => {
  const [form, setForm] = useState(initialState);

  return (
    <main>
      <h1>Lead Form Management</h1>
      <form>
        <label>
          Name *
          <input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Phone *
          <input name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label>
          Company
          <input name="company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
        </label>
        <label>
          Message
          <input name="message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </label>
        <label>
          Status *
          <input name="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} />
        </label>
        <button type="submit">Create Lead</button>
      </form>
    </main>
  );
};
