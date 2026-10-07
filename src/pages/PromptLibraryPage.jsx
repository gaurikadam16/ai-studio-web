import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icons.jsx';
import { PageHeader, EmptyState, TypeFilter } from './Shared.jsx';
import { PROMPT_LIBRARY, PROMPT_CATEGORIES, fillPrompt } from '../data/promptLibrary.js';
import { usePersistentState } from '../data/storage.js';

/**
 * Prompt Library: expert prompts with fill-in-the-blanks.
 * The user only changes the simple boxes (person, product, place...), we build the perfect prompt
 * and also apply the best settings. "Create now" generates straight away.
 */
export default function PromptLibraryPage({ userId, onUse }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');          // all | image | video
  const [category, setCategory] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = usePersistentState(`ai-studio-saved-prompts:${userId}`, []);
  const [recent, setRecent] = usePersistentState(`ai-studio-recent-prompts:${userId}`, []);
  const [open, setOpen] = useState(null);           // the prompt being customised

  const toggleSaved = (id) => setSaved((list) => (list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPT_LIBRARY.filter((t) =>
      (type === 'all' || t.mode === type)
      && (category === 'All' || t.category === category)
      && (!savedOnly || saved.includes(t.id))
      && (!q || `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(q)));
  }, [query, type, category, savedOnly, saved]);

  const recentItems = recent.map((id) => PROMPT_LIBRARY.find((t) => t.id === id)).filter(Boolean).slice(0, 6);
  const filtering = query || type !== 'all' || category !== 'All' || savedOnly;

  const use = (t, text, run) => {
    setRecent((list) => [t.id, ...list.filter((x) => x !== t.id)].slice(0, 12));
    setOpen(null);
    onUse(t, text, run);
  };

  return (
    <div className="page">
      <PageHeader
        title="Prompt Library"
        subtitle="Expert prompts for the best results. Change only the simple words — we handle the rest, including the best settings."
      >
        <TypeFilter value={type} onChange={setType} />
      </PageHeader>

      <div className="library-tools">
        <label className="search library-search">
          <Icon name="search" size={16} />
          <span className="sr-only">Search prompts</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: Diwali, logo, product, reel…" />
          {query && (
            <button className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}><Icon name="close" size={14} /></button>
          )}
        </label>
        <button className={`pill ${savedOnly ? 'is-on' : ''}`} aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          ★ Saved {saved.length > 0 && `(${saved.length})`}
        </button>
      </div>

      <div className="quick">
        {['All', ...PROMPT_CATEGORIES].map((c) => (
          <button key={c} className={`pill ${category === c ? 'is-on' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {!filtering && recentItems.length > 0 && (
        <div className="stack8">
          <span className="field-label">Recently used</span>
          <div className="row gap8 wrap">
            {recentItems.map((t) => (
              <button key={t.id} className="pill" onClick={() => setOpen(t)}>{t.emoji} {t.title}</button>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState icon="search" title="No prompts found" text={savedOnly ? 'Tap ☆ on a prompt to save it here.' : 'Try another word or category.'} />
      ) : (
        <div className="prompt-grid">
          {shown.map((t) => (
            <div key={t.id} className="prompt-card">
              <button className="prompt-cover" style={{ '--cover': t.color }} onClick={() => setOpen(t)} aria-label={`Customize ${t.title}`}>
                <span className="prompt-emoji" aria-hidden="true">{t.emoji}</span>
              </button>
              <button
                className={`prompt-star ${saved.includes(t.id) ? 'on' : ''}`}
                aria-label={saved.includes(t.id) ? 'Remove from saved' : 'Save prompt'}
                aria-pressed={saved.includes(t.id)}
                onClick={() => toggleSaved(t.id)}
              >
                {saved.includes(t.id) ? '★' : '☆'}
              </button>
              <div className="prompt-body">
                <div className="row gap8 wrap">
                  <span className={`type-badge ${t.mode}`}><Icon name={t.mode} size={13} /> {t.mode === 'image' ? 'Image' : 'Video'}</span>
                  {t.photos && <span className="type-badge photo"><Icon name="upload" size={12} /> {t.photos === 'required' ? 'Needs photo' : 'Photo optional'}</span>}
                </div>
                <strong>{t.title}</strong>
                <p className="muted small clamp2">{t.description}</p>
                <div className="grow" />
                <button className="btn-tint sm" onClick={() => setOpen(t)}>Customize & create</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <CustomizeDialog template={open} onClose={() => setOpen(null)} onUse={use} />}
    </div>
  );
}

// ------------------------------------------------------------------
// The "Customize" window: simple boxes + live preview of the final prompt
// ------------------------------------------------------------------
function CustomizeDialog({ template: t, onClose, onUse }) {
  const [values, setValues] = useState(() => Object.fromEntries(t.fields.map((f) => [f.key, f.default])));
  const [copied, setCopied] = useState(false);
  const finalText = fillPrompt(t, values);
  const needsPhoto = t.photos === 'required';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };

  const s = t.settings || {};
  const settingTags = t.mode === 'image'
    ? [s.style, s.size && `${s.size[0].toUpperCase()}${s.size.slice(1)} size`, s.count && `${s.count} images`]
    : [s.length && `${s.length} sec`, s.shape === 'vertical' ? 'Reels 9:16' : 'Landscape 16:9', s.camera, s.music ? 'With music' : 'No music'];

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal customize" role="dialog" aria-modal="true" aria-label={`Customize ${t.title}`} onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <div className="row gap10 min0">
            <span className="customize-emoji" style={{ '--cover': t.color }} aria-hidden="true">{t.emoji}</span>
            <div className="min0">
              <h2 className="h2">{t.title}</h2>
              <span className="muted small">{t.description}</span>
            </div>
          </div>
          <button className="icon-btn sm" aria-label="Close" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>

        <div className="customize-grid">
          {/* Left: simple boxes */}
          <div className="stack10">
            <span className="field-label">Change these</span>
            {t.fields.map((f) => (
              <label key={f.key} className="stack4">
                <span className="small strong">{f.label}</span>
                {f.options ? (
                  <select className="input" value={values[f.key]} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    className="input"
                    value={values[f.key]}
                    placeholder={f.placeholder || f.default}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
            <button className="text-btn small left" onClick={() => setValues(Object.fromEntries(t.fields.map((f) => [f.key, f.default])))}>
              Reset to example
            </button>
          </div>

          {/* Right: live preview + best settings */}
          <div className="stack10">
            <div className="row-between">
              <span className="field-label">Your prompt</span>
              <button className="text-btn tiny" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
            </div>
            <p className="prompt-preview">{finalText}</p>

            <span className="field-label">Best settings (applied for you)</span>
            <div className="tag-row">
              {settingTags.filter(Boolean).map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>

            {t.photos && (
              <div className={`photo-info ${needsPhoto ? 'is-warn' : 'has-photos'}`}>
                <span className="field-label">{needsPhoto ? 'Photo needed' : 'Tip'}</span>
                <span className="small">{t.photoHint}</span>
              </div>
            )}
          </div>
        </div>

        <div className="row gap8 wrap customize-actions">
          <span className="muted small grow">Tip: you can type in हिंदी or मराठी too.</span>
          <button className="btn-ghost sm" onClick={() => onUse(t, finalText, false)}>
            {needsPhoto ? 'Add photo & create' : 'Edit first'}
          </button>
          {!needsPhoto && (
            <button className="btn-primary sm" onClick={() => onUse(t, finalText, true)}>
              {t.mode === 'image' ? 'Create image now' : 'Create video now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}