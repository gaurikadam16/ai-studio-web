import { useRef } from 'react';
import Icon from './Icons.jsx';
import { useViewer } from './Lightbox.jsx';
import { TeaStallScene, SCENE_PALETTES } from './SceneArt.jsx';
import { IMAGE_SIZES, VIDEO_SHAPES } from '../data/constants.js';

// Turn "16:9" into the CSS value "16 / 9"
const cssRatio = (ratio) => ratio.replace(':', ' / ');
const imageRatio = (sizeId) => cssRatio((IMAGE_SIZES.find((z) => z.id === sizeId) || IMAGE_SIZES[0]).ratio);
const videoRatio = (shapeId) => cssRatio((VIDEO_SHAPES.find((v) => v.id === shapeId) || VIDEO_SHAPES[0]).ratio);

// The picture. Sample art gets a "style look"; real AI images/videos are shown as they are.
function Art({ r, i, style, video }) {
  if (r.url && video) return <video src={`${r.url}#t=0.1`} muted playsInline preload="metadata" />;
  if (r.url) return <img src={r.url} alt={`Result ${i + 1}`} />;
  const look = `art-look style-${(style || 'Realistic').toLowerCase()}`;
  return (
    <div className={look}>
      <TeaStallScene p={SCENE_PALETTES[r.paletteIndex ?? i % 4]} />
    </div>
  );
}

// Small labels showing which settings made this result
function SettingTags({ gen }) {
  const s = gen.settings || {};
  const tags = gen.type === 'video'
    ? [
        s.length && `${s.length} sec`,
        s.sceneCount ? `${s.sceneCount} scenes` : null,
        VIDEO_SHAPES.find((v) => v.id === s.shape)?.label,
        s.camera,
                s.photoCount ? `From ${s.photoCount} photo${s.photoCount > 1 ? 's' : ''}` : s.startFrom === 'photo' ? 'From photo' : 'From text',
        s.music && 'Music',
        s.voice && 'Voice-over',
      ]
    : [
              s.style,
        IMAGE_SIZES.find((z) => z.id === s.size)?.label,
        s.photoCount ? `${s.photoCount} photo${s.photoCount > 1 ? 's' : ''} used` : null,
        s.characterName && `Character: ${s.characterName}`,
        s.brandColors?.length && 'Brand Kit',
        s.negative && `Avoid: ${s.negative}`,
      ];
  const list = tags.filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="tag-row">
      {list.map((t) => <span key={t} className="tag">{t}</span>)}
    </div>
  );
}

// A normal video player: play/pause, sound, full screen, download
function VideoPlayer({ url, shape }) {
  const ref = useRef(null);
  const vertical = shape === 'vertical';
  const fullScreen = () => ref.current?.requestFullscreen?.();

  return (
    <div className={`video-real ${vertical ? 'shape-vertical' : 'shape-landscape'}`}>
      <video
        ref={ref}
        src={url}
        controls
        playsInline
        preload="metadata"
        style={{ aspectRatio: vertical ? '9 / 16' : '16 / 9' }}
      />
      <div className="row gap8 wrap">
        <button className="btn-ghost sm fit" onClick={fullScreen}>Full screen</button>
        <a className="btn-ghost sm fit" href={url} target="_blank" rel="noreferrer">Open in new tab</a>
        <a className="btn-ghost sm fit" href={url} download>Download video</a>
      </div>
    </div>
  );
}

function BrandStrip({ colors }) {
  if (!colors?.length) return null;
  return (
    <div className="brand-strip" aria-hidden="true">
      {colors.map((c, i) => <span key={i} style={{ background: c }} />)}
    </div>
  );
}

export default function Results({ generation, history, onPickHistory, loading, loadingSettings, favorites, onFavorite, onMakeVideo, onRegenerate, compare, compareMode, onCompare, jobProgress }) {
  const view = useViewer();
  const results = generation?.results || [];
  // Items for the full-screen viewer
  const viewItems = results.map((r) => ({ ...r, type: generation.type, prompt: generation.prompt, genId: generation.id }));
  const isVideo = generation?.type === 'video';
  const s = generation?.settings || {};

  return (
    <section className="results">
      <div className="row-between">
        <h2 className="h2">Your results</h2>
        <div className="row gap8">
          {!isVideo && (
            <button className="btn-ghost sm" onClick={() => onCompare('toggle-mode')} disabled={results.length < 2}>
              {compare.length ? `Compare (${compare.length}/2)` : 'Compare side by side'}
            </button>
          )}
          <button className="btn-ghost sm" onClick={onRegenerate} disabled={loading || !generation}>Regenerate</button>
        </div>
      </div>

      {/* Nothing made yet in this chat */}
      {!loading && !generation && (
        <div className="empty">
          <Icon name="image" size={28} />
          <p>Type an idea above and press Generate. Your results show up here.</p>
        </div>
      )}

      {/* Images loading: same count and shape you picked in Settings */}
      {loading && (
        <div className={`results-grid count-${loadingSettings.count}`}>
          {Array.from({ length: loadingSettings.count }).map((_, i) => (
            <div key={i} className="tile skeleton" style={{ aspectRatio: imageRatio(loadingSettings.size) }} aria-label="Generating" />
          ))}
        </div>
      )}

      {/* Images */}
      {!loading && generation && !isVideo && (
        <>
          <SettingTags gen={generation} />
          <div className={`results-grid count-${results.length}`}>
            {results.map((r, i) => {
              const fav = favorites.includes(r.id);
              const inCompare = compare.includes(r.id);
              return (
                <div key={r.id} className="result">
                  <div
                    className={`tile ${fav ? 'is-fav' : ''} ${inCompare ? 'is-compare' : ''}`}
                    style={{ aspectRatio: imageRatio(s.size) }}
                    onClick={() => (compareMode ? onCompare(r.id) : view(viewItems, i))}
                    title={compareMode ? 'Pick to compare' : 'View full size'}
                  >
                    <Art r={r} i={i} style={s.style} />
                    <span className="tile-label">Option {i + 1}</span>
                    {s.characterName && <span className="char-badge"><Icon name="character" size={12} /> {s.characterName}</span>}
                    <BrandStrip colors={s.brandColors} />
                    <button
                      className={`fav-btn ${fav ? 'on' : ''}`}
                      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={fav}
                      onClick={(e) => { e.stopPropagation(); onFavorite(r.id); }}
                    >
                      <Icon name="heart" size={15} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="tile-actions">
                    <button className="btn-ghost xs" onClick={() => view(viewItems, i)}>View</button>
                    <button className="btn-ghost xs">HD / 4K</button>
                    <button className="btn-tint xs" onClick={() => onMakeVideo(r)}>Make video</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Video */}
      {!loading && isVideo && (
        <>
          <SettingTags gen={generation} />
          <div className="video-card">
            {generation.status === 'failed' ? (
              <div className="video-pending" style={{ aspectRatio: videoRatio(s.shape) }}>
                <Icon name="video" size={26} />
                <strong>This video didn't finish</strong>
                <span className="muted small">{generation.error || 'Something went wrong.'} Press Regenerate to try again.</span>
              </div>
            ) : generation.status === 'done' && results[0]?.url ? (
              <VideoPlayer url={results[0].url} shape={s.shape} />
            ) : generation.status === 'done' ? (
              <div className={`tile video-tile shape-${s.shape || 'landscape'}`} style={{ aspectRatio: videoRatio(s.shape) }} onClick={() => view(viewItems, 0)}>
                <div className={`camera cam-${(s.camera || '').toLowerCase().replace(/[^a-z]/g, '')}`}>
                  <Art r={results[0] || {}} i={0} style="Realistic" />
                </div>
                <span className="tile-label">{s.length} sec video</span>
                <span className="big-play" aria-hidden="true">▶</span>
              </div>
            ) : (
              <div className={`video-pending shape-${s.shape || 'landscape'}`} style={{ aspectRatio: videoRatio(s.shape) }}>
                <Icon name="video" size={26} />
                <strong>Making your video…</strong>
                <div className="bar wide"><div className="bar-fill blue" style={{ width: `${jobProgress ?? 5}%` }} /></div>
                <span className="muted small">Takes 1–4 minutes. You can keep working or start a new chat.</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Short explanation of the image, written by the AI (like Gemini) */}
      {!loading && generation?.description && (
        <p className="ai-description">{generation.description}</p>
      )}

      {/* Exactly what was sent to the AI (your words + all settings) */}
      {!loading && generation?.finalPrompt && (
        <details className="sent-prompt">
          <summary>See the full prompt sent to the AI</summary>
          <p>{generation.finalPrompt}</p>
        </details>
      )}

      {/* Everything made earlier in this chat */}
      {history.length > 1 && (
        <div className="stack8">
          <span className="muted small strong">Earlier in this chat</span>
          <div className="history-strip">
            {history.map((g) => (
              <button
                key={g.id}
                className={`history-item ${g.id === generation?.id ? 'is-on' : ''}`}
                onClick={() => onPickHistory(g.id)}
                title={g.prompt}
                aria-label={`Show: ${g.prompt}`}
              >
                {g.results[0] ? <Art r={g.results[0]} i={0} style={g.settings?.style} video={g.type === 'video'} /> : <Icon name={g.type} size={18} />}
                {g.type === 'video' && g.results[0] && <span className="play-dot" aria-hidden="true">▶</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}