import { PageHeader } from './Shared.jsx';

export default function BrandKitPage({ brandKit, setBrandKit, onGoHome }) {
  const set = (patch) => setBrandKit((b) => ({ ...b, ...patch }));
  const setColor = (i, value) => set({ colors: brandKit.colors.map((c, idx) => (idx === i ? value : c)) });
  const removeColor = (i) => set({ colors: brandKit.colors.filter((_, idx) => idx !== i) });

  return (
    <div className="page narrow">
      <PageHeader title="Brand Kit" subtitle='Save your brand once. Turn on "Use my Brand Kit" in Settings and it gets added to every image.' />

      <div className="panel stack18">
        <label className="stack8">
          <span className="field-label">Brand name</span>
          <input className="input" value={brandKit.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Chai Point" maxLength={60} />
        </label>

        <div className="stack8">
          <span className="field-label">Brand colours</span>
          <div className="row gap10 wrap">
            {brandKit.colors.map((c, i) => (
              <div key={i} className="color-chip">
                <input type="color" value={c} onChange={(e) => setColor(i, e.target.value)} aria-label={`Colour ${i + 1}`} />
                <span className="small">{c.toUpperCase()}</span>
                <button className="tiny-btn" aria-label={`Remove colour ${i + 1}`} onClick={() => removeColor(i)}>✕</button>
              </div>
            ))}
            {brandKit.colors.length < 5 && (
              <button className="btn-ghost sm" onClick={() => set({ colors: [...brandKit.colors, '#888888'] })}>+ Add colour</button>
            )}
          </div>
        </div>

        <label className="stack8">
          <span className="field-label">Style / tone</span>
          <input className="input" value={brandKit.tone} onChange={(e) => set({ tone: e.target.value })} placeholder="e.g. warm, friendly, premium, minimal" maxLength={120} />
        </label>

        <label className="stack8">
          <span className="field-label">Things to always include</span>
          <input className="input" value={brandKit.keywords} onChange={(e) => set({ keywords: e.target.value })} placeholder="e.g. chai cups, green leaves, clean white background" maxLength={200} />
        </label>

        <div className="preview-box">
          <span className="field-label">What gets added to your prompt</span>
          <p className="small soft">{brandText(brandKit) || 'Fill in the fields above to see a preview.'}</p>
        </div>

        <div className="row gap8">
          <span className="muted small grow">Saved automatically.</span>
          <button className="btn-primary sm" onClick={onGoHome}>Done, start creating</button>
        </div>
      </div>
    </div>
  );
}

// Turns the brand kit into text that is added to the prompt
export function brandText(b) {
  const parts = [];
  if (b.name) parts.push(`for the brand "${b.name}"`);
  if (b.colors.length) parts.push(`brand colours ${b.colors.join(', ')}`);
  if (b.tone) parts.push(`${b.tone} style`);
  if (b.keywords) parts.push(`include ${b.keywords}`);
  return parts.join(', ');
}