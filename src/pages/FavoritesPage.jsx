import { PageHeader, EmptyState, MediaGrid } from './Shared.jsx';

export default function FavoritesPage({ items, favorites, onToggleFavorite, onOpen }) {
  const favItems = items.filter((it) => favorites.includes(it.id));

  return (
    <div className="page">
      <PageHeader title="Favorites" subtitle="Results you marked with a heart" />
      {favItems.length === 0 ? (
        <EmptyState icon="heart" title="No favorites yet" text="Tap the heart on any result to save it here." />
      ) : (
        <MediaGrid items={favItems} favorites={favorites} onToggleFavorite={onToggleFavorite} onOpen={onOpen} />
      )}
    </div>
  );
}