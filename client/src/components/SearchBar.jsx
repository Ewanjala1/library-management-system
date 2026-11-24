import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search books by title or author...' }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, onSearch]);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search books by title or author"
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => setSearchTerm('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
