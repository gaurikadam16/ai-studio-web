import { useState } from 'react';
import { PageHeader, EmptyState, MediaGrid, TypeFilter } from './Shared.jsx';

export default function GalleryPage({ items, favorites, onToggleFavorite, onOpen, onGoHome }) {
  const [type, setType] = useState('all');
  const shown = items.filter((it) => type === 'all' || it.type === type);

  return (
    <div className="page">
      <PageHeader title="My Gallery" subtitle={`${items.length} creations from all your chats`}>
        <TypeFilter value={type} onChange={setType} />
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon="gallery"
          title="Your gallery is empty"
          text="Everything you create will be collected here."
          action={<button className="btn-primary" onClick={onGoHome}>Create something</button>}
        />
      ) : shown.length === 0 ? (
        <EmptyState icon="gallery" title={`No ${type}s yet`} text="Try the other filter." />
      ) : (
        <MediaGrid items={shown} favorites={favorites} onToggleFavorite={onToggleFavorite} onOpen={onOpen} />
      )}
    </div>
  );
}