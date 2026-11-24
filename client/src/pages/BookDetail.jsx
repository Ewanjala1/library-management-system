import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/books/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Book not found');
          }
          throw new Error(`Failed to load book: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          if (!data) {
            throw new Error('Book not found');
          }
          setBook(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Error loading book details');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-container">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="detail-skeleton">
          <div className="skeleton-cover skeleton-pulse" />
          <div className="skeleton-details">
            <div className="skeleton-line skeleton-title skeleton-pulse" />
            <div className="skeleton-line skeleton-author skeleton-pulse" />
            <div className="skeleton-line skeleton-meta skeleton-pulse" />
            <div className="skeleton-line skeleton-meta skeleton-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-container">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="state-message error-state">
          <span className="state-icon">⚠️</span>
          <h2>Book Not Found</h2>
          <p>{error || 'The requested book could not be found.'}</p>
          <Link to="/" className="primary-btn">Return to Catalog</Link>
        </div>
      </div>
    );
  }

  const available = book.copiesAvailable ?? book.totalCopies ?? 0;
  const isAvailable = available > 0;
  const reviews = book.reviews || [];

  return (
    <div className="book-detail-container">
      <Link to="/" className="back-link">&larr; Back to Catalog</Link>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-badge-group">
            {book.genre?.name && (
              <span className="genre-pill">{book.genre.name}</span>
            )}
            <span className={`availability-tag ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
              {isAvailable ? `${available} Copies Available` : 'Out of Stock'}
            </span>
          </div>

          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">by <strong>{book.author}</strong></p>
        </div>

        <div className="detail-info-grid">
          <div className="info-item">
            <span className="info-label">ISBN:</span>
            <span className="info-value">{book.isbn}</span>
          </div>
          {book.publishedYear && (
            <div className="info-item">
              <span className="info-label">Published Year:</span>
              <span className="info-value">{book.publishedYear}</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-label">Total Copies:</span>
            <span className="info-value">{book.totalCopies ?? available}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Copies Available:</span>
            <span className="info-value">{available}</span>
          </div>
        </div>

        {book.genre?.description && (
          <div className="detail-description">
            <h3>About the Genre ({book.genre.name})</h3>
            <p>{book.genre.description}</p>
          </div>
        )}

        <div className="reviews-section">
          <h2>Community Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews have been written for this book yet.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.user?.name || 'Anonymous Reader'}
                    </span>
                    <span className="review-rating">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  {review.createdAt && (
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
