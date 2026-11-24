import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const available = book.copiesAvailable ?? book.totalCopies ?? 0;
  const isAvailable = available > 0;

  return (
    <div className="book-card">
      <div className="book-cover-accent">
        <span className="cover-icon">📖</span>
        {book.genre?.name && (
          <span className="genre-pill">{book.genre.name}</span>
        )}
      </div>

      <div className="book-info">
        <h3 className="book-title" title={book.title}>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="book-author">by {book.author}</p>

        <div className="book-meta">
          {book.publishedYear && (
            <span className="book-year">Published: {book.publishedYear}</span>
          )}
          <span className={`availability-tag ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
            {isAvailable ? `${available} available` : 'Out of stock'}
          </span>
        </div>

        <Link to={`/books/${book.id}`} className="view-details-btn">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
