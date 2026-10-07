import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Icon from './Icons.jsx';
import { TeaStallScene, SCENE_PALETTES } from './SceneArt.jsx';

/**
 * Full-screen viewer for images and videos.
 * Any component can open it with:   const view = useViewer();  view(items, index)
 * Each item: { id, url, type: 'image'|'video', prompt, chatId?, genId?, paletteIndex? }
 */
const ViewerContext = createContext(() => {});
export const useViewer = () => useContext(ViewerContext);

// Download a file. Works for links from other websites too (fal.ai), with a safe fallback.
async function downloadFile(url, name) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  } catch {
    window.open(url, '_blank', 'noopener'); // if the download is blocked, open it in a new tab
  }
}

function Lightbox({ items, index, setIndex, onClose, favorites, onToggleFavorite, onOpenChat }) {
  const item = items[index];
  const many = items.length > 1;
  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length, setIndex]);
  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length, setIndex]);

  // Keyboard: Esc = close, ← → = previous / next
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && many) prev();
      if (e.key === 'ArrowRight' && many) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next, many]);

  if (!item) return null;
  const fav = favorites.includes(item.id);
  const isVideo = item.type === 'video';
  const fileName = `${(item.prompt || 'creation').slice(0, 40).replace(/[^a-z0-9]+/gi, '-')}.${isVideo ? 'mp4' : 'jpg'}`;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={isVideo ? 'Video viewer' : 'Image viewer'} onClick={onClose}>
      {/* Top bar */}
      <div className="lb-top" onClick={(e) => e.stopPropagation()}>
        <div className="lb-info">
          <span className="lb-count">{index + 1} / {items.length}</span>
          <span className="lb-prompt" title={item.prompt}>{item.prompt}</span>
        </div>
        <div className="lb-actions">
          <button className={`lb-btn ${fav ? 'on' : ''}`} onClick={() => onToggleFavorite(item.id)} aria-pressed={fav}>
            <Icon name="heart" size={16} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'Saved' : 'Favorite'}
          </button>
          {item.url && (
            <button className="lb-btn" onClick={() => downloadFile(item.url, fileName)}>
              <Icon name="upload" size={16} style={{ transform: 'rotate(180deg)' }} /> Download
            </button>
          )}
          {item.chatId && (
            <button className="lb-btn" onClick={() => { onClose(); onOpenChat(item.chatId, item.genId); }}>
              Open chat
            </button>
          )}
          <button className="lb-btn icon" onClick={onClose} aria-label="Close viewer"><Icon name="close" size={18} /></button>
        </div>
      </div>

      {/* The big picture / video */}
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {isVideo && item.url ? (
          <video key={item.url} src={item.url} controls autoPlay playsInline className="lb-media" />
        ) : item.url ? (
          <img key={item.url} src={item.url} alt={item.prompt} className="lb-media" />
        ) : (
          <div className="lb-sample"><TeaStallScene p={SCENE_PALETTES[item.paletteIndex ?? 0]} /></div>
        )}
      </div>

      {/* Previous / next */}
      {many && (
        <>
          <button className="lb-arrow left" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <button className="lb-arrow right" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
        </>
      )}
    </div>
  );
}

export function ViewerProvider({ children, favorites, onToggleFavorite, onOpenChat }) {
  const [state, setState] = useState(null); // { items, index }
  const open = useCallback((items, index = 0) => setState({ items, index }), []);
  const close = useCallback(() => setState(null), []);
  const setIndex = useCallback((fn) => setState((s) => (s ? { ...s, index: typeof fn === 'function' ? fn(s.index) : fn } : s)), []);

  return (
    <ViewerContext.Provider value={open}>
      {children}
      {state && (
        <Lightbox
          items={state.items}
          index={state.index}
          setIndex={setIndex}
          onClose={close}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onOpenChat={onOpenChat}
        />
      )}
    </ViewerContext.Provider>
  );
}