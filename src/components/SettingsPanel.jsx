import { IMAGE_STYLES, IMAGE_SIZES, VIDEO_LENGTHS, VIDEO_SHAPES, CAMERA_MOVES, MAX_IMAGE_PHOTOS, MAX_VIDEO_PHOTOS } from '../data/constants.js';

function Chip({ active, onClick, children, tone = 'accent', className = '' }) {
  return (
    <button className={`chip ${active ? `is-on ${tone}` : ''} ${className}`} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

function Toggle({ label, on, onChange, tone = 'accent' }) {
  return (
    <button className="toggle-row" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span>{label}</span>
      <span className={`switch ${on ? `on ${tone}` : ''}`}><span className="knob" /></span>
    </button>
  );
}

// Explains what the uploaded photos will be used for
function PhotoInfo({ mode, count }) {
  let text;
  if (mode === 'image') {
    text = count
      ? `Using ${count} photo${count > 1 ? 's' : ''}. The AI keeps what's in them and changes what you describe.`
      : `No photos. Add up to ${MAX_IMAGE_PHOTOS} with "Add photos" to use your own people, products or style.`;
  } else if (count === 0) {
    text = `Video from your words. Add 1 photo to animate it, or 2–${MAX_VIDEO_PHOTOS} photos as references.`;
  } else if (count === 1) {
    text = 'Your photo will be the first frame of the video.';
  } else if (count <= MAX_VIDEO_PHOTOS) {
    text = `Using ${count} photos as references (people, objects, style). Mention them in your words.`;
  } else {
    text = `Too many photos for a video: remove ${count - MAX_VIDEO_PHOTOS} (maximum ${MAX_VIDEO_PHOTOS}).`;
  }
  const warn = mode === 'video' && count > MAX_VIDEO_PHOTOS;
  return (
    <div className={`photo-info ${count ? 'has-photos' : ''} ${warn ? 'is-warn' : ''}`}>
      <span className="field-label">Your photos</span>
      <span className="small">{text}</span>
    </div>
  );
}

export default function SettingsPanel({ mode, s, set, cost, hasBrandKit, onNavigate, onReset, finalPrompt, photoCount = 0 }) {
  return (
    <aside className="settings" aria-label="Settings">
      <div className="row-between">
        <h2 className="h2">Settings</h2>
        <div className="row gap8">
          <button className="text-btn small" onClick={onReset}>Reset</button>
          <span className="mode-pill">{mode === 'image' ? 'Image mode' : 'Video mode'}</span>
        </div>
      </div>

      <PhotoInfo mode={mode} count={photoCount} />

      {mode === 'image' ? (
        <div className="stack22">
          <div className="stack10">
            <span className="field-label">Style</span>
            <div className="grid3">
              {IMAGE_STYLES.map((st) => <Chip key={st} active={s.style === st} onClick={() => set({ style: st })}>{st}</Chip>)}
            </div>
          </div>

          <div className="stack10">
            <span className="field-label">Size</span>
            <div className="grid4">
              {IMAGE_SIZES.map((z) => (
                <Chip key={z.id} active={s.size === z.id} onClick={() => set({ size: z.id })} className="size-chip">
                  <span className="ratio-box" style={{ width: z.box[0], height: z.box[1] }} />
                  {z.label}
                </Chip>
              ))}
            </div>
            <span className="muted tiny">
              {photoCount ? 'With photos, the shape follows your photos.' : `${IMAGE_SIZES.find((z) => z.id === s.size)?.ratio} shape`}
            </span>
          </div>

          <div className="stack10">
            <span className="field-label">Number of images</span>
            <div className="grid4">
              {[1, 2, 3, 4].map((n) => <Chip key={n} active={s.count === n} onClick={() => set({ count: n })}>{n}</Chip>)}
            </div>
          </div>

          <div className="stack10">
            <label htmlFor="avoid" className="field-label">Avoid in image</label>
            <input id="avoid" className="input" value={s.negative} maxLength={200} onChange={(e) => set({ negative: e.target.value })} placeholder="e.g. blurry, extra fingers, text" />
          </div>

          <div className="stack8">
            <Toggle label="Use my Brand Kit" on={s.brandKit && hasBrandKit} onChange={(v) => (hasBrandKit ? set({ brandKit: v }) : onNavigate('brand'))} />
            {!hasBrandKit && (
              <button className="text-btn small left" onClick={() => onNavigate('brand')}>Set up your Brand Kit first →</button>
            )}
          </div>
        </div>
      ) : (
        <div className="stack22">
          <div className="stack10">
            <span className="field-label">Length</span>
            <div className="grid3">
              {VIDEO_LENGTHS.map((l) => <Chip tone="blue" key={l} active={s.length === l} onClick={() => set({ length: l })}>{l} sec</Chip>)}
            </div>
          </div>

          <div className="stack10">
            <span className="field-label">Shape</span>
            <div className="grid2">
              {VIDEO_SHAPES.map((v) => <Chip tone="blue" key={v.id} active={s.shape === v.id} onClick={() => set({ shape: v.id })}>{v.label}</Chip>)}
            </div>
            {photoCount === 1 && <span className="muted tiny">With 1 photo, the shape follows your photo.</span>}
          </div>

          <div className="stack10">
            <span className="field-label">Camera movement</span>
            <div className="grid3">
              {CAMERA_MOVES.map((c) => <Chip tone="blue" key={c} active={s.camera === c} onClick={() => set({ camera: c })}>{c}</Chip>)}
            </div>
          </div>

          <div className="stack8">
            <Toggle tone="blue" label="Add background music" on={s.music} onChange={(v) => set({ music: v })} />
            <span className="muted tiny">Music ON = the video has sound (costs more credits).</span>
          </div>
        </div>
      )}

      {/* Live preview: exactly what the AI will get when you press Generate */}
      <details className="sent-prompt">
        <summary>Preview what the AI will get</summary>
        <p>{finalPrompt || 'Type your idea in the box first.'}</p>
      </details>

      <div className="grow" />
      <div className="cost-box">
        <span className="soft small">This will use</span>
        <strong className="accent">{cost} credits</strong>
      </div>
    </aside>
  );
}