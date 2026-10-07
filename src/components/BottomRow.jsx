import { TeaStallScene, SCENE_PALETTES } from './SceneArt.jsx';
import { VideoThumb } from '../pages/Shared.jsx';

export default function BottomRow({ recent, jobs, onOpen }) {
  const running = jobs.filter((j) => j.status === 'running');
  const latest = running[0];

  return (
    <div className="bottom-row">
      <section className="panel grow min0">
        <strong>Recent creations</strong>
        {recent.length === 0 ? (
          <span className="muted small">Nothing yet. Everything you make will collect here.</span>
        ) : (
          <div className="thumbs">
            {recent.map((r) => (
              <button key={r.id} className="thumb" onClick={() => onOpen(r.chatId, r.genId)} title={r.prompt}>
                {r.url && r.type === 'video' ? (
                  <VideoThumb url={r.url} />
                ) : r.url ? (
                  <img src={r.url} alt="" loading="lazy" />
                ) : (
                  <TeaStallScene p={SCENE_PALETTES[r.paletteIndex ?? 0]} />
                )}
                {r.type === 'video' && <span className="play-dot" aria-label="Video">▶</span>}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel queue">
        <strong>{latest ? 'Working on it' : 'Video queue'}</strong>
        {latest ? (
          <>
            <div className="row-between small soft">
              <span className="ellipsis">{latest.title}</span>
              <span>{latest.progress}%</span>
            </div>
            <div className="bar"><div className="bar-fill blue" style={{ width: `${latest.progress}%` }} /></div>
            <span className="muted small">
              You can keep working meanwhile{running.length > 1 ? ` · ${running.length - 1} more waiting` : ''}
            </span>
          </>
        ) : (
          <span className="muted small">No videos in progress.</span>
        )}
      </section>
    </div>
  );
}