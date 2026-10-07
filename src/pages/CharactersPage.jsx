import { useState } from 'react';
import { PageHeader, EmptyState } from './Shared.jsx';

const COLORS = ['#3A3F52', '#4A3A34', '#2F4A3E', '#4A2F45', '#3E3A2A', '#2A3A4A'];
const EMPTY = { name: '', description: '' };

export default function CharactersPage({ characters, setCharacters }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const save = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    if (!name || !description) return;
    if (editingId) {
      setCharacters((list) => list.map((c) => (c.id === editingId ? { ...c, name, description } : c)));
    } else {
      const color = COLORS[characters.length % COLORS.length];
      setCharacters((list) => [...list, { id: `char_${Date.now()}`, name, description, color }]);
    }
    setForm(EMPTY);
    setEditingId(null);
  };

  const edit = (c) => { setEditingId(c.id); setForm({ name: c.name, description: c.description }); };
  const remove = (c) => {
    if (window.confirm(`Delete ${c.name}?`)) setCharacters((list) => list.filter((x) => x.id !== c.id));
  };

  return (
    <div className="page narrow">
      <PageHeader title="My Characters" subtitle="Describe a person once, then pick them in Settings to keep them looking the same." />

      <form className="panel stack18" onSubmit={save}>
        <strong>{editingId ? 'Edit character' : 'Add a character'}</strong>
        <label className="stack8">
          <span className="field-label">Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aarav" maxLength={20} required />
        </label>
        <label className="stack8">
          <span className="field-label">How they look</span>
          <textarea className="input textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. 8 year old Indian boy, curly hair, big smile, yellow t-shirt" maxLength={300} required />
          <span className="muted tiny">The more detail, the more the same they look in every picture.</span>
        </label>
        <div className="row gap8">
          <button className="btn-primary sm" type="submit">{editingId ? 'Save changes' : 'Add character'}</button>
          {editingId && <button type="button" className="btn-ghost sm" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      {characters.length === 0 ? (
        <EmptyState icon="character" title="No characters yet" text="Add your first one above." />
      ) : (
        <div className="stack10">
          {characters.map((c) => (
            <div key={c.id} className="list-row card-row">
              <span className="char static" style={{ background: c.color }}>{c.name.slice(0, 3)}</span>
              <div className="grow min0 stack4">
                <strong>{c.name}</strong>
                <span className="muted small clamp2">{c.description}</span>
              </div>
              <button className="btn-ghost xs fit" onClick={() => edit(c)}>Edit</button>
              <button className="btn-ghost xs fit danger" onClick={() => remove(c)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}