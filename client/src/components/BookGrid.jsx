import { useState, useEffect } from 'react';
import BookCard from './BookCard';
import BookSkeleton from './BookSkeleton';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BookGrid({ genreId, search, sortBy = 'title-asc' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (genreId) params.append('genreId', genreId);
    if (search && search.trim()) params.append('search', search.trim());

    const queryString = params.toString();
    const url = `${API_BASE}/books${queryString ? `?${queryString}` : ''}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load books: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          const list = Array.isArray(data) ? data : data.data || [];
          setBooks(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'An error occurred while fetching books.');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [genreId, search]);

  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
    if (sortBy === 'author-asc') return (a.author || '').localeCompare(b.author || '');
    if (sortBy === 'author-desc') return (b.author || '').localeCompare(a.author || '');
    return 0;
  });

  if (loading) {
    return (
      <div className="book-grid-container">
        <div className="book-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <BookSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-message error-state">
        <span className="state-icon">⚠️</span>
        <h3>Unable to load catalog</h3>
        <p>{error}</p>
        <button
          type="button"
          className="retry-btn"
          onClick={() => {
            setLoading(true);
            setError(null);
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sortedBooks.length === 0) {
    return (
      <div className="state-message empty-state">
        <span className="state-icon">🔍</span>
        <h3>No books found</h3>
        <p>We couldn't find any books matching your current filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="book-grid-container">
      <div className="results-count">
        Showing {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'}
      </div>
      <div className="book-grid">
        {sortedBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
