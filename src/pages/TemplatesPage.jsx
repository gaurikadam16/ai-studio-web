import { useState } from 'react';
import Icon from '../components/Icons.jsx';
import { PageHeader } from './Shared.jsx';
import { TEMPLATES } from '../data/constants.js';

export default function TemplatesPage({ onUse }) {
  const categories = ['All', ...new Set(TEMPLATES.map((t) => t.category))];
  const [cat, setCat] = useState('All');
  const shown = TEMPLATES.filter((t) => cat === 'All' || t.category === cat);

  return (
    <div className="page">
      <PageHeader title="Templates" subtitle="Pick a starting point. It fills in the prompt and settings for you." />

      <div className="quick">
        {categories.map((c) => (
          <button key={c} className={`pill ${cat === c ? 'is-on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="card-grid">
        {shown.map((t) => (
          <div key={t.id} className="card">
            <div className="row gap8">
              <span className={`type-badge ${t.mode}`}><Icon name={t.mode} size={14} /> {t.mode === 'image' ? 'Image' : 'Video'}</span>
              <span className="muted tiny">{t.category}</span>
            </div>
            <strong>{t.label}</strong>
            <p className="muted small clamp3">{t.prompt}</p>
            <div className="grow" />
            <button className="btn-tint sm" onClick={() => onUse(t)}>Use this template</button>
          </div>
        ))}
      </div>
    </div>
  );
}