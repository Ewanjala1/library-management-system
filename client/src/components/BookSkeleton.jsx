export default function BookSkeleton() {
  return (
    <div className="book-card skeleton-card">
      <div className="skeleton-cover skeleton-pulse" />
      <div className="book-info">
        <div className="skeleton-line skeleton-title skeleton-pulse" />
        <div className="skeleton-line skeleton-author skeleton-pulse" />
        <div className="skeleton-line skeleton-meta skeleton-pulse" />
        <div className="skeleton-line skeleton-btn skeleton-pulse" />
      </div>
    </div>
  );
}
