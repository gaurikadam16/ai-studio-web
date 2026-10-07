import { useRef } from 'react';
import Icon from '../components/Icons.jsx';
import { useViewer } from '../components/Lightbox.jsx';
import { TeaStallScene, SCENE_PALETTES } from '../components/SceneArt.jsx';

// Title bar used at the top of every page
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="muted page-sub">{subtitle}</p>}
      </div>
      {children && <div className="row gap8">{children}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={28} />
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

// Video thumbnail: shows the first frame, plays silently on hover
export function VideoThumb({ url }) {
  const ref = useRef(null);
  const play = () => ref.current?.play().catch(() => {});
  const stop = () => {
    if (!ref.current) return;
    ref.current.pause();
    ref.current.currentTime = 0.1;
  };

  return (
    <video
      ref={ref}
      src={`${url}#t=0.1`} // "#t=0.1" makes the browser show the first frame as a picture
      muted
      loop
      playsInline
      preload="metadata"
      onMouseEnter={play}
      onMouseLeave={stop}
    />
  );
}

// One picture or video inside a grid
function Media({ it }) {
  if (it.url && it.type === 'video') return <VideoThumb url={it.url} />;
  if (it.url) return <img src={it.url} alt={it.prompt} loading="lazy" />;
  return <TeaStallScene p={SCENE_PALETTES[it.paletteIndex ?? 0]} />; // old sample result
}

// Grid of images / videos with a heart. Click = open the full-screen viewer (Gallery, Favorites, Projects)
export function MediaGrid({ items, favorites, onToggleFavorite }) {
  const view = useViewer();
  return (
    <div className="media-grid">
      {items.map((it, i) => {
        const fav = favorites.includes(it.id);
        return (
          <div key={it.id} className="media-card">
            <button className="media-thumb" onClick={() => view(items, i)} title="View full size">
              <Media it={it} />
              {it.type === 'video' && (
                <span className="video-badge" aria-hidden="true">
                  <Icon name="video" size={12} /> Video
                </span>
              )}
              {it.type === 'video' && !it.url && <span className="sample-badge">Sample</span>}
            </button>
            <button
              className={`fav-btn ${fav ? 'on' : ''}`}
              aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={fav}
              onClick={() => onToggleFavorite(it.id)}
            >
              <Icon name="heart" size={15} fill={fav ? 'currentColor' : 'none'} />
            </button>
            <div className="media-info">
              <span className="ellipsis small" title={it.prompt}>{it.prompt}</span>
              <span className="muted tiny">{new Date(it.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// All / Images / Videos switch
export function TypeFilter({ value, onChange }) {
  return (
    <div className="seg" role="tablist" aria-label="Show">
      {['all', 'image', 'video'].map((t) => (
        <button key={t} role="tab" aria-selected={value === t} className={value === t ? 'on' : ''} onClick={() => onChange(t)}>
          {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'Videos'}
        </button>
      ))}
    </div>
  );
}