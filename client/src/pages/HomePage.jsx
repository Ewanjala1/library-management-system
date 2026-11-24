import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import BookGrid from '../components/BookGrid';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE}/genres`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch genres');
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          const list = Array.isArray(data) ? data : data.data || [];
          setGenres(list);
          setLoadingGenres(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadingGenres(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setGenreId('');
    setSortBy('title-asc');
  };

  const hasActiveFilters = Boolean(search || genreId);

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 className="hero-title">Browse Our Library Catalog</h1>
        <p className="hero-subtitle">
          Explore thousands of titles across literature, science, history, technology, and more.
        </p>

        <div className="search-section">
          <SearchBar onSearch={setSearch} placeholder="Search books by title or author..." />
        </div>
      </section>

      <section className="catalog-section">
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="genre-filter" className="filter-label">Genre:</label>
            <select
              id="genre-filter"
              className="filter-select"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              disabled={loadingGenres}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select" className="filter-label">Sort By:</label>
            <select
              id="sort-select"
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="author-asc">Author (A-Z)</option>
              <option value="author-desc">Author (Z-A)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>

        <BookGrid genreId={genreId} search={search} sortBy={sortBy} />
      </section>
    </div>
  );
}
